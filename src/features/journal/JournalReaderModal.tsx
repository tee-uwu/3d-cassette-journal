import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Edit3,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

export const JournalReaderModal: React.FC = () => {
  const {
    journals,
    selectedJournalId,
    activeJournalPage,
    setSelectedJournalId,
    setActiveJournalPage,
    setEditJournalModalOpen,
  } = useTapeStore();

  const journal = journals.find((j) => j.id === selectedJournalId) || journals[0];

  // Dynamic pages list (defaults to the 7 authentic Bhoi Ka Journal spreads)
  const pages = useMemo(() => {
    if (journal?.pages && journal.pages.length > 0) {
      return journal.pages;
    }
    return [
      {
        id: 'p-1',
        page_number: 1,
        title: 'bhoi ka journal · Page 1',
        date: 'Spread 01',
        content: 'Why send correspondence · Stay true',
        photo_url: '/journal/page-1.jpg',
      },
    ];
  }, [journal]);

  const [currentPage, setCurrentPage] = useState<number>(activeJournalPage || 0);

  // Responsive device check
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // UI Modes
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);

  // 3D Physical Page Turn States
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [fromPage, setFromPage] = useState<number>(0);
  const [toPage, setToPage] = useState<number>(0);

  // Real-Time Touch Drag Engine for 3D Leaf Rotation
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragAngle, setDragAngle] = useState<number>(0); // 0 to -180 for next, -180 to 0 for prev
  const [dragDirection, setDragDirection] = useState<'next' | 'prev' | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const lastTapTime = useRef<number>(0);

  // Sync with store when activeJournalPage changes
  const [prevActivePage, setPrevActivePage] = useState(activeJournalPage);
  if (activeJournalPage !== prevActivePage) {
    setPrevActivePage(activeJournalPage);
    if (activeJournalPage !== undefined && activeJournalPage >= 0 && activeJournalPage < pages.length) {
      setCurrentPage(activeJournalPage);
    }
  }

  // Preload images for instant 60fps renders
  useEffect(() => {
    pages.forEach((p) => {
      const src = p.photo_url || p.sketch_data;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [pages]);

  const getPageImage = (idx: number) => {
    const p = pages[idx];
    return p?.photo_url || p?.sketch_data || journal?.cover_photo || '/journal/page-1.jpg';
  };

  const getPageTitle = (idx: number) => {
    const p = pages[idx];
    return p?.title || `Spread ${idx + 1}`;
  };

  // Turn page programmatically (tap Next / Prev / arrow keys / thumbnails)
  const turnPage = useCallback(
    (targetIndex: number) => {
      if (isFlipping || isDragging) return;
      if (targetIndex === currentPage) return;
      if (targetIndex < 0 || targetIndex >= pages.length) return;

      const direction = targetIndex > currentPage ? 'next' : 'prev';
      audioEngine.playPageFlipSound();

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }

      setFromPage(currentPage);
      setToPage(targetIndex);
      setFlipDirection(direction);
      setIsFlipping(true);

      // 440ms match for the refined 3D physics animation
      const timer = setTimeout(() => {
        setCurrentPage(targetIndex);
        setActiveJournalPage(targetIndex);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 440);

      return () => clearTimeout(timer);
    },
    [currentPage, isFlipping, isDragging, pages.length, setActiveJournalPage]
  );

  const handleNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      turnPage(currentPage + 1);
    }
  }, [currentPage, pages.length, turnPage]);

  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      turnPage(currentPage - 1);
    }
  }, [currentPage, turnPage]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedJournalId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        setSelectedJournalId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedJournalId, handleNext, handlePrev, setSelectedJournalId]);

  // ============================================================
  // TOUCH GESTURE ENGINE (Real-Time 3D Leaf Rotation)
  // ============================================================
  const onTouchStart = (e: React.TouchEvent) => {
    if (isFlipping || isZoomed) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = performance.now();
    isHorizontalSwipe.current = null;
    setIsDragging(false);
    setDragAngle(0);
    setDragDirection(null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || isFlipping || isZoomed) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Detect horizontal drag intent
    if (isHorizontalSwipe.current === null) {
      if (Math.hypot(deltaX, deltaY) > 8) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
        if (isHorizontalSwipe.current) {
          // Initialize drag direction and pages
          if (deltaX < 0 && currentPage < pages.length - 1) {
            setDragDirection('next');
            setFromPage(currentPage);
            setToPage(currentPage + 1);
            setIsDragging(true);
          } else if (deltaX > 0 && currentPage > 0) {
            setDragDirection('prev');
            setFromPage(currentPage);
            setToPage(currentPage - 1);
            setIsDragging(true);
          }
        }
      }
    }

    if (isHorizontalSwipe.current && isDragging) {
      const halfWidth = (containerRef.current?.offsetWidth || 360) * 0.5;

      if (dragDirection === 'next') {
        // Dragging left: angle goes from 0deg down to -180deg
        const progress = Math.max(-1, Math.min(0, deltaX / halfWidth));
        setDragAngle(progress * 180);
      } else if (dragDirection === 'prev') {
        // Dragging right: angle goes from -180deg up to 0deg
        const progress = Math.min(1, Math.max(0, deltaX / halfWidth));
        setDragAngle(-180 + progress * 180);
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current - endY;
    const elapsed = performance.now() - touchStartTime.current;
    const velocity = Math.abs(diffX) / Math.max(1, elapsed);

    touchStartX.current = null;
    touchStartY.current = null;

    if (isZoomed) {
      const now = performance.now();
      if (now - lastTapTime.current < 320) {
        setIsZoomed(false);
      }
      lastTapTime.current = now;
      return;
    }

    if (isHorizontalSwipe.current && isDragging && dragDirection) {
      const destDirection = dragDirection;
      setIsDragging(false);

      if (destDirection === 'next') {
        // Did we pull past midpoint (-85deg) or flick quickly?
        if (dragAngle < -85 || (diffX > 25 && velocity > 0.3)) {
          // Complete forward turn
          setDragAngle(-180);
          audioEngine.playPageFlipSound();
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);

          setTimeout(() => {
            setCurrentPage((p) => {
              const nextIdx = Math.min(pages.length - 1, p + 1);
              setActiveJournalPage(nextIdx);
              return nextIdx;
            });
            setDragDirection(null);
            setDragAngle(0);
          }, 220);
        } else {
          // Snap back to 0deg
          setDragAngle(0);
          setTimeout(() => {
            setDragDirection(null);
          }, 200);
        }
      } else if (destDirection === 'prev') {
        // Did we pull past midpoint (-95deg) or flick quickly?
        if (dragAngle > -95 || (diffX < -25 && velocity > 0.3)) {
          // Complete backward turn
          setDragAngle(0);
          audioEngine.playPageFlipSound();
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);

          setTimeout(() => {
            setCurrentPage((p) => {
              const nextIdx = Math.max(0, p - 1);
              setActiveJournalPage(nextIdx);
              return nextIdx;
            });
            setDragDirection(null);
            setDragAngle(0);
          }, 220);
        } else {
          // Snap back to -180deg
          setDragAngle(-180);
          setTimeout(() => {
            setDragDirection(null);
            setDragAngle(0);
          }, 200);
        }
      }
    } else if (!isDragging && Math.hypot(diffX, diffY) < 12) {
      // Tap detection
      const now = performance.now();
      if (now - lastTapTime.current < 320) {
        setIsZoomed((z) => !z);
      } else {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const relX = (endX - rect.left) / rect.width;
          if (relX < 0.28 && currentPage > 0) {
            handlePrev();
          } else if (relX > 0.72 && currentPage < pages.length - 1) {
            handleNext();
          }
        }
      }
      lastTapTime.current = now;
    }

    setIsDragging(false);
    isHorizontalSwipe.current = null;
  };

  if (!selectedJournalId || !journal) return null;

  // Paper stack thickness calculation
  const totalPages = Math.max(1, pages.length - 1);
  const leftStackPx = Math.round((currentPage / totalPages) * 7);
  const rightStackPx = Math.round(((pages.length - 1 - currentPage) / totalPages) * 7);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      onClick={() => setSelectedJournalId(null)}
    >
      <div
        className="relative w-full max-w-6xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[96vh] bg-[#231d17]/95 border-0 sm:border border-[#4a3a2d] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col pt-[max(0.25rem,env(safe-area-inset-top))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================ */}
        {/* 1. TOP HEADER BAR */}
        {/* ============================================================ */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-[#3d2e22] flex items-center justify-between bg-[#1f1914] text-[#EFE7D8] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#745037] flex items-center justify-center shadow-xs flex-shrink-0"
              style={{ backgroundColor: journal.cover_color || '#4a3222' }}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#f5ebd9]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <h2 className="text-sm sm:text-base font-semibold text-[#f5ebd9] tracking-tight font-serif capitalize truncate max-w-[130px] sm:max-w-xs">
                  {journal.title}
                </h2>
                <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3a2c20] text-[#cbb89e] border border-[#523e2e] whitespace-nowrap">
                  {currentPage + 1}/{pages.length}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#9b8973] truncate max-w-[170px] sm:max-w-sm">
                {getPageTitle(currentPage)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setEditJournalModalOpen(true, journal.id)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-[#34271c] text-[#e3d3bd] border border-[#543e2d] hover:bg-[#4d3826] hover:text-white active:scale-95 transition-all shadow-xs"
              title="Edit Journal & Pages"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#d8a25e]" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className={`p-1.5 sm:p-2 rounded-full border transition-all ${
                isZoomed
                  ? 'bg-[#d8a25e] text-[#241a13] border-[#d8a25e]'
                  : 'text-[#b5a38c] border-[#543e2d] hover:text-[#f5ebd9] hover:bg-[#34271c]'
              }`}
              title={isZoomed ? 'Reset Zoom' : 'Zoom 1.8x (Double Tap)'}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setSelectedJournalId(null)}
              className="p-1.5 sm:p-2 rounded-full text-[#b5a38c] hover:text-[#f5ebd9] hover:bg-[#34271c] border border-transparent hover:border-[#543e2d] transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. MAIN 3D READING STAGE */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-hidden p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_#34281e_0%,_#17120e_100%)] min-h-0">
          <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-40" />

          {/* Desktop Floating Navigation Chevron: Previous */}
          <button
            onClick={handlePrev}
            disabled={currentPage <= 0 || isFlipping || isDragging}
            className="hidden sm:flex absolute left-2 sm:left-4 md:left-6 z-40 p-2.5 sm:p-3 rounded-full bg-[#241a13]/90 text-[#EFE7D8] border border-[#523e2e] shadow-xl hover:bg-[#3b2b1f] hover:scale-105 active:scale-95 disabled:opacity-20 disabled:hover:scale-100 disabled:hover:bg-[#241a13]/90 transition-all items-center justify-center"
            title="Previous Page (←)"
          >
            <ChevronLeft className="w-5 h-5 text-[#d8a25e]" />
          </button>

          {/* Desktop Floating Navigation Chevron: Next */}
          <button
            onClick={handleNext}
            disabled={currentPage >= pages.length - 1 || isFlipping || isDragging}
            className="hidden sm:flex absolute right-2 sm:right-4 md:right-6 z-40 p-2.5 sm:p-3 rounded-full bg-[#241a13]/90 text-[#EFE7D8] border border-[#523e2e] shadow-xl hover:bg-[#3b2b1f] hover:scale-105 active:scale-95 disabled:opacity-20 disabled:hover:scale-100 disabled:hover:bg-[#241a13]/90 transition-all items-center justify-center"
            title="Next Page (→)"
          >
            <ChevronRight className="w-5 h-5 text-[#d8a25e]" />
          </button>

          {/* Zoom notification banner */}
          {isZoomed && (
            <div className="absolute top-3 z-30 px-3 py-1 rounded-full bg-[#1b140f]/90 border border-[#d8a25e]/50 text-[#f5ebd9] text-xs font-mono shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
              <span className="w-2 h-2 rounded-full bg-[#d8a25e] animate-ping" />
              <span>1.8x Inspect View · Drag to pan · Double-tap to reset</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3D BOOK PERSPECTIVE VIEWPORT */}
          {/* ============================================================ */}
          <div
            ref={containerRef}
            className={`book-perspective w-full max-w-4xl flex items-center justify-center transition-transform duration-300 ${
              isZoomed ? 'scale-175 sm:scale-125 cursor-grab active:cursor-grabbing z-30' : ''
            }`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* HARDCOVER PHYSICAL ALBUM CONTAINER */}
            <div
              className="book-spread-container relative w-full aspect-[1.38/1] max-h-[62vh] sm:max-h-[72vh] p-1.5 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-2xl bg-[#3a271a] border-2 border-[#543a26] transition-all duration-300"
              style={{
                boxShadow: `
                  -${leftStackPx + 3}px ${leftStackPx + 4}px 0 #281b12,
                  ${rightStackPx + 3}px ${rightStackPx + 4}px 0 #281b12,
                  0 25px 50px -12px rgba(0, 0, 0, 0.85)
                `,
              }}
            >
              {/* Embossed Gold Stitching along Leather Perimeter */}
              <div className="absolute inset-1 rounded-lg sm:rounded-xl border border-dashed border-[#8c6743]/40 pointer-events-none z-10" />

              {/* BOOK PAPER SPREAD VIEWPORT */}
              <div className="relative w-full h-full rounded-md sm:rounded-lg overflow-hidden bg-[#FAF7F2] shadow-inner flex">
                {/* CENTER BOOK GUTTER / VERTICAL SPINE CREASE */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 sm:w-10 bg-gradient-to-r from-transparent via-black/35 to-transparent pointer-events-none z-30 mix-blend-multiply" />
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-black/40 pointer-events-none z-30" />

                {/* Left & Right Interactive Click/Tap Turn Zones (when idle) */}
                {!isFlipping && !isDragging && !isZoomed && (
                  <>
                    <div
                      className="absolute top-0 bottom-0 left-0 w-1/4 z-25 cursor-pointer flex items-center justify-start pl-2 group"
                      onClick={handlePrev}
                      title={currentPage > 0 ? 'Click to turn previous page' : ''}
                    >
                      {currentPage > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/40 text-white backdrop-blur-xs">
                          <ChevronLeft className="w-5 h-5 text-[#d8a25e]" />
                        </div>
                      )}
                    </div>
                    <div
                      className="absolute top-0 bottom-0 right-0 w-1/4 z-25 cursor-pointer flex items-center justify-end pr-2 group"
                      onClick={handleNext}
                      title={currentPage < pages.length - 1 ? 'Click to turn next page' : ''}
                    >
                      {currentPage < pages.length - 1 && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/40 text-white backdrop-blur-xs">
                          <ChevronRight className="w-5 h-5 text-[#d8a25e]" />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ============================================================ */}
                {/* CASE A: STATIC VIEW (Idle) */}
                {/* ============================================================ */}
                {!isFlipping && !isDragging && (
                  <div className="relative w-full h-full flex select-none">
                    {pages[currentPage]?.photo_url ? (
                      <img
                        src={pages[currentPage].photo_url}
                        alt={getPageTitle(currentPage)}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      /* Antique Handwritten Paper Fallback */
                      <div className="w-full h-full flex bg-[#faf5ec] text-[#2b221a]">
                        <div className="w-1/2 h-full p-4 sm:p-6 md:p-10 flex flex-col justify-between border-r border-[#3a2f26]/10">
                          <div>
                            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#8c6b4b] mb-1 sm:mb-2">
                              {pages[currentPage]?.date || `Spread ${currentPage + 1}`}
                            </div>
                            <h3 className="font-serif-title text-base sm:text-xl md:text-2xl font-bold text-[#3a281c] mb-2 sm:mb-4">
                              {pages[currentPage]?.title || `Spread ${currentPage + 1}`}
                            </h3>
                            {pages[currentPage]?.lyrics && (
                              <blockquote className="italic font-serif text-[11px] sm:text-xs md:text-sm text-[#543c2c] border-l-2 border-[#8c6b4b]/40 pl-2.5 sm:pl-3.5 my-2 sm:my-4 leading-relaxed">
                                &ldquo;{pages[currentPage].lyrics}&rdquo;
                              </blockquote>
                            )}
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-mono text-[#8c6b4b]/70">
                            {journal.title} · Page {currentPage * 2 + 1}
                          </div>
                        </div>

                        <div className="w-1/2 h-full p-4 sm:p-6 md:p-10 flex flex-col justify-between">
                          <div className="font-serif text-[11px] sm:text-xs md:text-sm text-[#3b2b20] leading-relaxed whitespace-pre-wrap">
                            {pages[currentPage]?.content || 'Quiet thoughts and memories gathered under amber lamplight.'}
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-mono text-right text-[#8c6b4b]/70">
                            Page {currentPage * 2 + 2}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Corner Page-Curl Hint Affordance (invites touch) */}
                    {currentPage < pages.length - 1 && (
                      <div
                        className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 pointer-events-none z-20 bg-gradient-to-tl from-black/25 via-transparent to-transparent corner-curl-hint"
                        title="Swipe or tap to turn page"
                      />
                    )}

                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 bg-[#f7f0df]/10 mix-blend-multiply pointer-events-none" />
                  </div>
                )}

                {/* ============================================================ */}
                {/* CASE B: REAL-TIME TOUCH DRAGGING IN 3D */}
                {/* ============================================================ */}
                {isDragging && dragDirection && (
                  <div className="relative w-full h-full flex select-none">
                    {/* BASE LEFT HALF */}
                    <div className="relative w-1/2 h-full overflow-hidden">
                      <img
                        src={getPageImage(dragDirection === 'next' ? fromPage : toPage)}
                        alt="Left base"
                        className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                      />
                      {dragDirection === 'prev' && (
                        <div
                          className="absolute inset-0 bg-black/40 pointer-events-none"
                          style={{ opacity: Math.max(0, 1 - Math.abs(dragAngle) / 180) }}
                        />
                      )}
                    </div>

                    {/* BASE RIGHT HALF */}
                    <div className="relative w-1/2 h-full overflow-hidden">
                      <img
                        src={getPageImage(dragDirection === 'next' ? toPage : fromPage)}
                        alt="Right base"
                        className="absolute top-0 left-[-100%] w-[200%] max-w-none h-full object-cover object-right pointer-events-none"
                      />
                      {dragDirection === 'next' && (
                        <div
                          className="absolute inset-0 bg-black/40 pointer-events-none"
                          style={{ opacity: Math.max(0, (180 - Math.abs(dragAngle)) / 180) }}
                        />
                      )}
                    </div>

                    {/* 3D TURNING LEAF ROTATING IN REAL-TIME */}
                    <div
                      className="book-leaf-turning"
                      style={{
                        transform: `rotateY(${dragAngle}deg)`,
                        transition: 'none',
                        boxShadow:
                          dragAngle < -90
                            ? `${Math.abs(dragAngle + 90) * 0.25}px 8px 30px rgba(25, 15, 8, 0.4)`
                            : `-${Math.abs(dragAngle) * 0.25}px 8px 30px rgba(25, 15, 8, 0.4)`,
                      }}
                    >
                      {/* FRONT FACE: Current right page */}
                      <div className="book-leaf-front">
                        <img
                          src={getPageImage(dragDirection === 'next' ? fromPage : toPage)}
                          alt="Turning front"
                          className="absolute top-0 left-[-100%] w-[200%] max-w-none h-full object-cover object-right pointer-events-none"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-black/35 pointer-events-none"
                          style={{ opacity: Math.min(1, Math.abs(dragAngle) / 90) }}
                        />
                      </div>

                      {/* BACK FACE: Destination left page */}
                      <div className="book-leaf-back">
                        <img
                          src={getPageImage(dragDirection === 'next' ? toPage : fromPage)}
                          alt="Turning back"
                          className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-black/35 via-white/20 to-transparent pointer-events-none"
                          style={{ opacity: Math.min(1, Math.abs(dragAngle + 180) / 90) }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* CASE C: PROGRAMMATIC 3D FLIP FORWARD (Next Spread) */}
                {/* ============================================================ */}
                {isFlipping && flipDirection === 'next' && (
                  <div className="relative w-full h-full flex select-none">
                    {/* BASE LEFT HALF: fromPage Left */}
                    <div className="relative w-1/2 h-full overflow-hidden">
                      <img
                        src={getPageImage(fromPage)}
                        alt="Left base current"
                        className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                      />
                    </div>

                    {/* BASE RIGHT HALF: toPage Right with shadow */}
                    <div className="relative w-1/2 h-full overflow-hidden">
                      <img
                        src={getPageImage(toPage)}
                        alt="Right base next"
                        className="absolute top-0 left-[-100%] w-[200%] max-w-none h-full object-cover object-right pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent anim-base-shadow pointer-events-none" />
                    </div>

                    {/* 3D TURNING LEAF (0deg -> -180deg) */}
                    <div className="book-leaf-turning anim-flip-forward">
                      {/* FRONT FACE: fromPage Right */}
                      <div className="book-leaf-front">
                        <img
                          src={getPageImage(fromPage)}
                          alt="Turning front"
                          className="absolute top-0 left-[-100%] w-[200%] max-w-none h-full object-cover object-right pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-black/35 anim-sheen-forward pointer-events-none" />
                      </div>

                      {/* BACK FACE: toPage Left */}
                      <div className="book-leaf-back">
                        <img
                          src={getPageImage(toPage)}
                          alt="Turning back"
                          className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-white/30 to-transparent anim-sheen-backward pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* CASE D: PROGRAMMATIC 3D FLIP BACKWARD (Previous Spread) */}
                {/* ============================================================ */}
                {isFlipping && flipDirection === 'prev' && (
                  <div className="relative w-full h-full flex select-none">
                    {/* BASE LEFT HALF: toPage Left with shadow */}
                    <div className="relative w-1/2 h-full overflow-hidden">
                      <img
                        src={getPageImage(toPage)}
                        alt="Left base prev"
                        className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/20 to-transparent anim-base-shadow pointer-events-none" />
                    </div>

                    {/* BASE RIGHT HALF: fromPage Right */}
                    <div className="relative w-1/2 h-full overflow-hidden">
                      <img
                        src={getPageImage(fromPage)}
                        alt="Right base current"
                        className="absolute top-0 left-[-100%] w-[200%] max-w-none h-full object-cover object-right pointer-events-none"
                      />
                    </div>

                    {/* 3D TURNING LEAF (-180deg -> 0deg) */}
                    <div className="book-leaf-turning anim-flip-backward">
                      {/* BACK FACE: fromPage Left */}
                      <div className="book-leaf-back">
                        <img
                          src={getPageImage(fromPage)}
                          alt="Turning back"
                          className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/40 to-black/35 anim-sheen-backward pointer-events-none" />
                      </div>

                      {/* FRONT FACE: toPage Right */}
                      <div className="book-leaf-front">
                        <img
                          src={getPageImage(toPage)}
                          alt="Turning front"
                          className="absolute top-0 left-[-100%] w-[200%] max-w-none h-full object-cover object-right pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-white/30 to-transparent anim-sheen-forward pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* MOBILE DEDICATED THUMB CONTROLS (Bottom Center Pill) */}
          {/* ============================================================ */}
          <div className="flex sm:hidden items-center justify-between gap-2.5 px-3 py-2 mt-2 w-full max-w-sm mx-auto z-40">
            <button
              onClick={handlePrev}
              disabled={currentPage <= 0 || isFlipping || isDragging}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2b1f16]/95 border border-[#543e2d] text-[#f5ebd9] active:scale-95 disabled:opacity-30 disabled:active:scale-100 font-medium text-xs shadow-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-[#d8a25e]" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => setShowThumbnails((v) => !v)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1 active:scale-95 transition-all shadow-md ${
                showThumbnails
                  ? 'bg-[#d8a25e] text-[#241a13] border-[#d8a25e]'
                  : 'bg-[#34271c]/95 border-[#5c4431] text-[#e3d3bd]'
              }`}
            >
              <span>{currentPage + 1}/{pages.length}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentPage >= pages.length - 1 || isFlipping || isDragging}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2b1f16]/95 border border-[#543e2d] text-[#f5ebd9] active:scale-95 disabled:opacity-30 disabled:active:scale-100 font-medium text-xs shadow-lg transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-[#d8a25e]" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. BOTTOM THUMBNAIL RIBBON (Desktop Always, Mobile Toggle) */}
        {/* ============================================================ */}
        <div
          className={`px-3 sm:px-6 py-2 sm:py-3 border-t border-[#3d2e22] bg-[#1a1410] flex-shrink-0 transition-all ${
            showThumbnails || !isMobile ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 text-xs text-[#9b8973] font-mono whitespace-nowrap hidden sm:flex">
              <span>Swipe or:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#2b1f16] border border-[#483526] text-[10px] text-[#e0cfba]">
                ←
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[#2b1f16] border border-[#483526] text-[10px] text-[#e0cfba]">
                →
              </kbd>
            </div>

            {/* Interactive Thumbnails Ribbon */}
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 mx-auto scrollbar-none max-w-2xl">
              {pages.map((p, idx) => {
                const isActive = currentPage === idx;
                const imgSrc = p.photo_url || p.sketch_data;
                return (
                  <button
                    key={p.id || idx}
                    onClick={() => turnPage(idx)}
                    disabled={isFlipping || isDragging}
                    className={`group relative flex-shrink-0 w-12 sm:w-16 md:w-20 aspect-[1.38/1] rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      isActive
                        ? 'border-[#d8a25e] ring-2 ring-[#d8a25e]/40 scale-105 shadow-md'
                        : 'border-[#423122] opacity-60 hover:opacity-100 hover:border-[#8c6743]'
                    }`}
                    title={`Jump to Spread ${idx + 1}: ${p.title}`}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#f2ebd9] flex items-center justify-center text-[9px] text-[#3a281c] font-serif font-bold p-1 text-center truncate">
                        #{idx + 1}
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0 left-0 right-0 py-0.5 text-center text-[8px] sm:text-[9px] font-mono font-bold ${
                        isActive ? 'bg-[#d8a25e] text-[#241a13]' : 'bg-black/60 text-[#d4c5b3]'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-right text-[11px] sm:text-xs text-[#9b8973] font-mono whitespace-nowrap hidden sm:block">
              {currentPage + 1}/{pages.length} Spreads
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalReaderModal;
