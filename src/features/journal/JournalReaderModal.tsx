import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import {
  BookOpen,
  LayoutGrid,
  Search,
  MoreHorizontal,
  Share,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  PenTool,
  X,
  Upload,
  Paintbrush,
  Check,
  Menu,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';
import { PaperCanvas } from './PaperCanvas';

export const JournalReaderModal: React.FC = () => {
  const {
    journals,
    selectedJournalId,
    activeJournalPage,
    setSelectedJournalId,
    setActiveJournalPage,
    setEditJournalModalOpen,
    setShareModalOpen,
    addJournalPage,
    deleteJournalPage,
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
        lyrics: '“Dream without fear, Love without limits...”',
        photo_url: '/journal/page-1.jpg',
      },
      {
        id: 'p-2',
        page_number: 2,
        title: 'bhoi ka journal · Page 2',
        date: 'Spread 02',
        content: 'Learn from yesterday, live for today · 22',
        lyrics: '“Say yes to new adventures · Good things come in small packages · Celebrate life”',
        photo_url: '/journal/page-2.jpg',
      },
      {
        id: 'p-3',
        page_number: 3,
        title: 'bhoi ka journal · Page 3',
        date: 'Spread 03',
        content: 'Love yourself · Look up you’ll see the stars',
        lyrics: '“All things grow · Fearless · How to know the butterflies”',
        photo_url: '/journal/page-3.jpg',
      },
      {
        id: 'p-4',
        page_number: 4,
        title: 'bhoi ka journal · Page 4',
        date: 'Spread 04',
        content: 'Artful collages & botanical clippings',
        lyrics: '“Fragments of memories preserved in paper and time.”',
        photo_url: '/journal/page-4.jpg',
      },
      {
        id: 'p-5',
        page_number: 5,
        title: 'bhoi ka journal · Page 5',
        date: 'Spread 05',
        content: 'Vintage stamps, postcards & coffee reflections',
        lyrics: '“Every dried flower holds a whisper of sunlight.”',
        photo_url: '/journal/page-5.jpg',
      },
      {
        id: 'p-6',
        page_number: 6,
        title: 'bhoi ka journal · Page 6',
        date: 'Spread 06',
        content: 'Late night scribbles & paper lace keepsakes',
        lyrics: '“Quiet thoughts gathered under warm amber lamp light.”',
        photo_url: '/journal/page-6.jpg',
      },
      {
        id: 'p-7',
        page_number: 7,
        title: 'bhoi ka journal · Page 7',
        date: 'Spread 07',
        content: 'Epilogue · Dreams, horizons & journeys',
        lyrics: '“The story continues on the next horizon.”',
        photo_url: '/journal/page-7.jpg',
      },
    ];
  }, [journal]);

  const [currentPage, setCurrentPage] = useState<number>(activeJournalPage || 0);

  // 3D Physical Opening & Closing States
  const [isOpening, setIsOpening] = useState<boolean>(true);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // UI Modes
  const [isGridViewOpen, setIsGridViewOpen] = useState<boolean>(false);
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<'draw' | 'photo'>('draw');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3D Physical Page Turn States (Paper by FiftyThree Physics)
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

  // Trigger tactile opening animation & rich audio flutter whenever book is opened
  useEffect(() => {
    if (selectedJournalId) {
      setIsOpening(true);
      setIsClosing(false);
      audioEngine.playBookOpenSound();

      const timer = setTimeout(() => {
        setIsOpening(false);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [selectedJournalId]);

  // Smooth physical close transition back to shelf
  const handleCloseBook = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    audioEngine.playPageFlipSound();

    setTimeout(() => {
      setSelectedJournalId(null);
      setIsClosing(false);
    }, 450);
  }, [isClosing, setSelectedJournalId]);

  // Show quick toast message
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

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

  // Turn page programmatically (tap Next / Prev / arrow keys / fanned stacks)
  const turnPage = useCallback(
    (targetIndex: number) => {
      if (isFlipping || isDragging || isOpening || isClosing) return;
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

      const timer = setTimeout(() => {
        setCurrentPage(targetIndex);
        setActiveJournalPage(targetIndex);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 440);

      return () => clearTimeout(timer);
    },
    [currentPage, isFlipping, isDragging, isOpening, isClosing, pages.length, setActiveJournalPage]
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
      if (isAddPageModalOpen || isDeleteConfirmOpen) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        if (isGridViewOpen) {
          setIsGridViewOpen(false);
        } else {
          handleCloseBook();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedJournalId, handleNext, handlePrev, handleCloseBook, isGridViewOpen, isAddPageModalOpen, isDeleteConfirmOpen]);

  // ============================================================
  // UNIFIED POINTER GESTURE ENGINE (Mouse & Touch Real-Time 3D Leaf Rotation)
  // ============================================================
  const isPointerActive = useRef<boolean>(false);

  const handlePointerStart = (clientX: number, clientY: number) => {
    if (isFlipping || isGridViewOpen || isOpening || isClosing) return;
    touchStartX.current = clientX;
    touchStartY.current = clientY;
    touchStartTime.current = performance.now();
    isHorizontalSwipe.current = null;
    isPointerActive.current = true;
    setIsDragging(false);
    setDragAngle(0);
    setDragDirection(null);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isPointerActive.current || touchStartX.current === null || touchStartY.current === null || isFlipping || isGridViewOpen || isOpening || isClosing) return;
    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;

    // Detect horizontal drag intent
    if (isHorizontalSwipe.current === null) {
      if (Math.hypot(deltaX, deltaY) > 6) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
        if (isHorizontalSwipe.current) {
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
        const progress = Math.max(-1, Math.min(0, deltaX / halfWidth));
        setDragAngle(progress * 180);
      } else if (dragDirection === 'prev') {
        const progress = Math.min(1, Math.max(0, deltaX / halfWidth));
        setDragAngle(-180 + progress * 180);
      }
    }
  };

  const handlePointerEnd = (clientX: number, clientY: number) => {
    if (!isPointerActive.current || touchStartX.current === null || touchStartY.current === null) return;
    isPointerActive.current = false;
    const diffX = touchStartX.current - clientX;
    const diffY = touchStartY.current - clientY;
    const elapsed = performance.now() - touchStartTime.current;
    const velocity = Math.abs(diffX) / Math.max(1, elapsed);

    touchStartX.current = null;
    touchStartY.current = null;

    if (isHorizontalSwipe.current && isDragging && dragDirection) {
      const destDirection = dragDirection;
      setIsDragging(false);

      if (destDirection === 'next') {
        if (dragAngle < -85 || (diffX > 25 && velocity > 0.3)) {
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
          setDragAngle(0);
          setTimeout(() => setDragDirection(null), 200);
        }
      } else if (destDirection === 'prev') {
        if (dragAngle > -95 || (diffX < -25 && velocity > 0.3)) {
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
          setDragAngle(-180);
          setTimeout(() => {
            setDragDirection(null);
            setDragAngle(0);
          }, 200);
        }
      }
    } else if (!isDragging && Math.hypot(diffX, diffY) < 12) {
      // Tap detection on spread halves
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const relX = (clientX - rect.left) / rect.width;
        if (relX < 0.28 && currentPage > 0) {
          handlePrev();
        } else if (relX > 0.72 && currentPage < pages.length - 1) {
          handleNext();
        }
      }
    }

    setIsDragging(false);
    isHorizontalSwipe.current = null;
  };

  // Window global mouse up listener
  useEffect(() => {
    const onWindowMouseUp = (e: MouseEvent) => {
      if (isPointerActive.current) {
        handlePointerEnd(e.clientX, e.clientY);
      }
    };
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => window.removeEventListener('mouseup', onWindowMouseUp);
  }, [dragDirection, dragAngle, currentPage, pages.length]);

  // Export / Share current spread
  const handleShareSpread = () => {
    if (navigator.share) {
      navigator.share({
        title: `${journal.title} · ${getPageTitle(currentPage)}`,
        text: `Check out this sketchbook spread from ${journal.title}`,
        url: window.location.href,
      }).catch(() => {
        setShareModalOpen(true);
      });
    } else {
      setShareModalOpen(true);
    }
  };

  // Delete current page
  const confirmDeletePage = () => {
    if (pages.length <= 1) {
      showToast('A journal must have at least one spread!');
      setIsDeleteConfirmOpen(false);
      return;
    }
    const pageToDelete = pages[currentPage];
    deleteJournalPage(journal.id, pageToDelete.id);
    setIsDeleteConfirmOpen(false);
    showToast('Spread deleted');
    const newIdx = Math.max(0, Math.min(pages.length - 2, currentPage));
    setCurrentPage(newIdx);
    setActiveJournalPage(newIdx);
  };

  // Add new canvas sketch or photo
  const handleSaveDrawnPage = (dataUrl: string) => {
    addJournalPage(journal.id, {
      title: newTitle || `Spread ${pages.length + 1}`,
      date: `Spread ${String(pages.length + 1).padStart(2, '0')}`,
      content: 'Original hand-drawn artwork',
      sketch_data: dataUrl,
    });
    setIsAddPageModalOpen(false);
    setNewTitle('');
    showToast('New hand-drawn spread added!');
    setTimeout(() => {
      turnPage(pages.length);
    }, 200);
  };

  const handleSavePhotoPage = () => {
    if (!newPhotoUrl.trim()) return;
    addJournalPage(journal.id, {
      title: newTitle || `Spread ${pages.length + 1}`,
      date: `Spread ${String(pages.length + 1).padStart(2, '0')}`,
      content: 'Imported photo artwork',
      photo_url: newPhotoUrl.trim(),
    });
    setIsAddPageModalOpen(false);
    setNewPhotoUrl('');
    setNewTitle('');
    showToast('New photo spread added!');
    setTimeout(() => {
      turnPage(pages.length);
    }, 200);
  };

  // ============================================================
  // AUTHENTIC SADDLE LEATHER COVER RENDERERS
  // ============================================================
  const renderFrontCoverContent = () => (
    <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#7e5538] via-[#65432a] to-[#4e321e] border border-[#9d724f]/40 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-5 sm:p-7 select-none">
      {/* Leather Grain Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      {/* Spine Crease / Binding Line on Left */}
      <div className="absolute top-0 bottom-0 left-0 w-7 bg-gradient-to-r from-black/45 via-black/10 to-transparent pointer-events-none border-r border-white/10" />

      {/* Dark Elastic Band on Right */}
      <div className="absolute top-0 bottom-0 right-6 sm:right-9 w-4 sm:w-5 bg-[#2a1d13] shadow-[inset_0_0_4px_rgba(0,0,0,0.8),2px_0_6px_rgba(0,0,0,0.4)] pointer-events-none" />

      {/* Center Polaroid Artwork Label */}
      <div className="relative z-10 w-[78%] max-w-[270px] bg-[#f5eedb] p-3 sm:p-4 rounded-sm shadow-[0_12px_30px_rgba(0,0,0,0.45)] border border-[#d8caa8] flex flex-col items-center transform -rotate-0.5">
        <div className="w-full aspect-[4/3] rounded-xs overflow-hidden bg-[#e0d6c3] shadow-inner mb-2.5">
          <img
            src="/journal/page-1.jpg"
            alt="Cover artwork"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-['Caveat',cursive] text-2xl sm:text-3xl font-bold text-[#352518] leading-tight text-center tracking-wide">
          {journal.title || 'bhoi ka journal'}
        </h3>
        <p className="font-['Caveat',cursive] text-sm sm:text-base font-semibold text-[#6d513a] mt-0.5 text-center">
          {pages.length} pages · 2026
        </p>
      </div>
    </div>
  );

  const renderBackCoverContent = () => (
    <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#7e5538] via-[#65432a] to-[#4e321e] border border-[#9d724f]/40 shadow-2xl overflow-hidden flex items-center justify-center p-6 select-none">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-7 bg-gradient-to-l from-black/45 via-black/10 to-transparent pointer-events-none border-l border-white/10" />
      <div className="text-center text-white/30 font-['Caveat',cursive] text-lg sm:text-xl">
        bhoi ka journal
      </div>
    </div>
  );

  if (!selectedJournalId || !journal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between paper-ios-bg text-[#FFFFFF] select-none overflow-hidden"
      onClick={() => {
        if (isGridViewOpen) setIsGridViewOpen(false);
      }}
    >
      {/* Toast notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/80 border border-white/20 text-white text-xs font-medium shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. PAPER FOR iOS TOP HEADER */}
      {/* ============================================================ */}
      <header
        className={`w-full px-4 sm:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between z-40 flex-shrink-0 transition-all duration-500 ease-out ${
          isOpening || isClosing ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Left: Close Book & Grid View Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={handleCloseBook}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white/90 shadow-sm"
            title="Close Journal to Shelf (Esc)"
          >
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <button
            onClick={() => setIsGridViewOpen(!isGridViewOpen)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all flex items-center justify-center shadow-sm ${
              isGridViewOpen
                ? 'bg-white text-[#2a2a2a] border-white'
                : 'border-white/20 bg-white/10 text-white/90 hover:bg-white/20 active:scale-95'
            }`}
            title="Grid View (All Pages)"
          >
            <LayoutGrid className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* Center: Title & Page Count (Exact Paper for iOS Typography) */}
        <div className="text-center">
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-white capitalize leading-tight">
            {journal.title || 'bhoi ka journal'}
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-white/70 font-medium tracking-wide mt-0.5">
            <PenTool className="w-3 h-3 text-white/60" />
            <span>{pages.length} Pages</span>
          </div>
        </div>

        {/* Right: Search, Menu & Close (Paper for iOS Image 1 & 2) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setEditJournalModalOpen(true, journal.id)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white/90 shadow-sm"
            title="Search & Journal Details"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <button
            onClick={() => setEditJournalModalOpen(true, journal.id)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white/90 shadow-sm"
            title="Journal Menu"
          >
            <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <button
            onClick={handleCloseBook}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white/90 shadow-sm"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. PHYSICAL 3D SKETCHBOOK STAGE */}
      {/* ============================================================ */}
      <main className="flex-1 w-full flex items-center justify-center relative px-2 sm:px-6 overflow-hidden min-h-0">
        {/* Soft Ambient Studio Downlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* 3D BOOK PERSPECTIVE STAGE */}
        <div
          ref={containerRef}
          className={`book-perspective relative w-full max-w-4xl h-[62vh] sm:h-[68vh] flex items-center justify-center select-none ${
            isOpening ? 'anim-book-open' : isClosing ? 'anim-book-close' : ''
          }`}
          onTouchStart={(e) => handlePointerStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={(e) => handlePointerEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
          onMouseDown={(e) => handlePointerStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={(e) => handlePointerEnd(e.clientX, e.clientY)}
        >
          {/* Ambient Ground Shadow under the open book */}
          <div className="absolute -bottom-8 w-[88%] h-14 bg-black/75 blur-2xl rounded-full pointer-events-none" />

          {/* ============================================================ */}
          {/* A. LEFT FANNED ACCORDION STACK (Receding in 3D to the left) */}
          {/* ============================================================ */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Previous page leaves (from currentPage - 1 down to 0) */}
            {Array.from({ length: currentPage }).map((_, i) => {
              const pageIdx = currentPage - 1 - i;
              if (i >= 4) return null; // Show up to 4 previous leaves in fan
              const offset = i + 1;
              const zIndex = 18 - offset;
              const tx = -(offset * 30 + 16);
              const tz = -(offset * 34 + 18);
              const ry = -(11 + offset * 2.6);

              return (
                <div
                  key={`left-leaf-${pageIdx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    turnPage(pageIdx);
                  }}
                  title={`Turn back to Spread ${pageIdx + 1}`}
                  className={`paper-fan-item paper-fan-item-left absolute w-[76vw] sm:w-[68vw] max-w-2xl sm:max-w-3xl aspect-[1.42/1] rounded-2xl overflow-hidden cursor-pointer pointer-events-auto bg-[#faf5ec] shadow-[-16px_18px_38px_rgba(0,0,0,0.55)] border border-black/20 ${
                    isOpening ? 'anim-fan-out-left' : isClosing ? 'anim-fan-in-left' : ''
                  }`}
                  style={
                    {
                      zIndex,
                      transformOrigin: 'right center',
                      transform: isOpening || isClosing ? undefined : `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`,
                      '--target-tx': `${tx}px`,
                      '--target-tz': `${tz}px`,
                      '--target-ry': `${ry}deg`,
                      animationDelay: isOpening ? `${offset * 35}ms` : undefined,
                    } as React.CSSProperties
                  }
                >
                  <img
                    src={getPageImage(pageIdx)}
                    alt={getPageTitle(pageIdx)}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {/* Depth Shading Overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/45 pointer-events-none"
                    style={{ opacity: Math.min(0.85, 0.35 + offset * 0.12) }}
                  />
                </div>
              );
            })}

            {/* Front Cover Leaf (Always fanned at the very outer edge of the left fan) */}
            {(() => {
              const leftLeavesCount = Math.min(4, currentPage);
              const coverOffset = leftLeavesCount + 1;
              const zIndex = 18 - coverOffset;
              const tx = -(coverOffset * 30 + 18);
              const tz = -(coverOffset * 34 + 22);
              const ry = -(12 + coverOffset * 2.6);

              return (
                <div
                  key="left-front-cover"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentPage > 0) turnPage(0);
                  }}
                  title={currentPage > 0 ? 'Turn to Spread 1' : 'Front Cover'}
                  className={`paper-fan-item paper-fan-item-left absolute w-[76vw] sm:w-[68vw] max-w-2xl sm:max-w-3xl aspect-[1.42/1] rounded-2xl overflow-hidden cursor-pointer pointer-events-auto shadow-[-18px_20px_42px_rgba(0,0,0,0.65)] border border-[#9d724f]/40 ${
                    isOpening ? 'anim-fan-out-left' : isClosing ? 'anim-fan-in-left' : ''
                  }`}
                  style={
                    {
                      zIndex,
                      transformOrigin: 'right center',
                      transform: isOpening || isClosing ? undefined : `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`,
                      '--target-tx': `${tx}px`,
                      '--target-tz': `${tz}px`,
                      '--target-ry': `${ry}deg`,
                      animationDelay: isOpening ? `${coverOffset * 35}ms` : undefined,
                    } as React.CSSProperties
                  }
                >
                  {renderFrontCoverContent()}
                  {/* Depth Shading */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/40 pointer-events-none"
                    style={{ opacity: Math.min(0.85, 0.4 + coverOffset * 0.1) }}
                  />
                </div>
              );
            })()}
          </div>

          {/* ============================================================ */}
          {/* B. RIGHT FANNED ACCORDION STACK (Receding in 3D to the right) */}
          {/* ============================================================ */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Next page leaves (from currentPage + 1 up to pages.length - 1) */}
            {Array.from({ length: Math.max(0, pages.length - 1 - currentPage) }).map((_, i) => {
              const pageIdx = currentPage + 1 + i;
              if (i >= 4) return null; // Show up to 4 upcoming leaves in fan
              const offset = i + 1;
              const zIndex = 18 - offset;
              const tx = offset * 30 + 16;
              const tz = -(offset * 34 + 18);
              const ry = 11 + offset * 2.6;

              return (
                <div
                  key={`right-leaf-${pageIdx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    turnPage(pageIdx);
                  }}
                  title={`Turn to Spread ${pageIdx + 1}`}
                  className={`paper-fan-item paper-fan-item-right absolute w-[76vw] sm:w-[68vw] max-w-2xl sm:max-w-3xl aspect-[1.42/1] rounded-2xl overflow-hidden cursor-pointer pointer-events-auto bg-[#faf5ec] shadow-[16px_18px_38px_rgba(0,0,0,0.55)] border border-black/20 ${
                    isOpening ? 'anim-fan-out-right' : isClosing ? 'anim-fan-in-right' : ''
                  }`}
                  style={
                    {
                      zIndex,
                      transformOrigin: 'left center',
                      transform: isOpening || isClosing ? undefined : `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`,
                      '--target-tx': `${tx}px`,
                      '--target-tz': `${tz}px`,
                      '--target-ry': `${ry}deg`,
                      animationDelay: isOpening ? `${offset * 35}ms` : undefined,
                    } as React.CSSProperties
                  }
                >
                  <img
                    src={getPageImage(pageIdx)}
                    alt={getPageTitle(pageIdx)}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {/* Depth Shading Overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/25 to-black/45 pointer-events-none"
                    style={{ opacity: Math.min(0.85, 0.35 + offset * 0.12) }}
                  />
                </div>
              );
            })}

            {/* Back Cover Leaf (Always fanned at the very outer edge of the right fan) */}
            {(() => {
              const rightLeavesCount = Math.min(4, Math.max(0, pages.length - 1 - currentPage));
              const coverOffset = rightLeavesCount + 1;
              const zIndex = 18 - coverOffset;
              const tx = coverOffset * 30 + 18;
              const tz = -(coverOffset * 34 + 22);
              const ry = 12 + coverOffset * 2.6;

              return (
                <div
                  key="right-back-cover"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentPage < pages.length - 1) turnPage(pages.length - 1);
                  }}
                  title={currentPage < pages.length - 1 ? `Turn to Spread ${pages.length}` : 'Back Cover'}
                  className={`paper-fan-item paper-fan-item-right absolute w-[76vw] sm:w-[68vw] max-w-2xl sm:max-w-3xl aspect-[1.42/1] rounded-2xl overflow-hidden cursor-pointer pointer-events-auto shadow-[18px_20px_42px_rgba(0,0,0,0.65)] border border-[#9d724f]/40 ${
                    isOpening ? 'anim-fan-out-right' : isClosing ? 'anim-fan-in-right' : ''
                  }`}
                  style={
                    {
                      zIndex,
                      transformOrigin: 'left center',
                      transform: isOpening || isClosing ? undefined : `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`,
                      '--target-tx': `${tx}px`,
                      '--target-tz': `${tz}px`,
                      '--target-ry': `${ry}deg`,
                      animationDelay: isOpening ? `${coverOffset * 35}ms` : undefined,
                    } as React.CSSProperties
                  }
                >
                  {renderBackCoverContent()}
                  {/* Depth Shading */}
                  <div
                    className="absolute inset-0 bg-gradient-to-l from-black/55 via-black/20 to-black/40 pointer-events-none"
                    style={{ opacity: Math.min(0.85, 0.4 + coverOffset * 0.1) }}
                  />
                </div>
              );
            })()}
          </div>

          {/* ============================================================ */}
          {/* C. ACTIVE CENTER SPREAD CONTAINER (100% OPAQUE - No Layover) */}
          {/* ============================================================ */}
          <div className="book-spread-container relative w-[76vw] sm:w-[68vw] max-w-2xl sm:max-w-3xl aspect-[1.42/1] rounded-2xl bg-[#faf5ec] shadow-[0_28px_65px_-12px_rgba(0,0,0,0.75)] z-20 overflow-hidden">
            {/* Center spine seam depression & stitch detail */}
            <div className="paper-spine-crease" />

            {/* Left & Right Interactive Click/Tap Turn Zones */}
            {!isFlipping && !isDragging && !isOpening && !isClosing && (
              <>
                <div
                  className="absolute top-0 bottom-0 left-0 w-1/4 z-30 cursor-pointer flex items-center justify-start pl-3 group"
                  onClick={handlePrev}
                  title={currentPage > 0 ? 'Turn previous page (←)' : ''}
                >
                  {currentPage > 0 && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/40 text-white backdrop-blur-xs">
                      <ChevronLeft className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div
                  className="absolute top-0 bottom-0 right-0 w-1/4 z-30 cursor-pointer flex items-center justify-end pr-3 group"
                  onClick={handleNext}
                  title={currentPage < pages.length - 1 ? 'Turn next page (→)' : ''}
                >
                  {currentPage < pages.length - 1 && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/40 text-white backdrop-blur-xs">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ============================================================ */}
            {/* VIEW 1: STATIC RESTING SPREAD (Only Current Page Content) */}
            {/* ============================================================ */}
            {!isFlipping && !isDragging && (
              <div className="relative w-full h-full flex select-none">
                {/* Left Half Spread (reveals smoothly during book opening) */}
                <div className={`relative w-1/2 h-full overflow-hidden ${isOpening ? 'anim-left-reveal' : ''}`}>
                  <img
                    src={getPageImage(currentPage)}
                    alt="Left spread half"
                    className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                  />
                </div>
                {/* Right Half Spread */}
                <div className="relative w-1/2 h-full overflow-hidden">
                  <img
                    src={getPageImage(currentPage)}
                    alt="Right spread half"
                    className="absolute top-0 left-[-100%] w-[200%] max-w-none h-full object-cover object-right pointer-events-none"
                  />
                </div>
                {/* Subtle warm paper texture fiber */}
                <div className="absolute inset-0 bg-[#f7f0df]/8 mix-blend-multiply pointer-events-none" />
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 2: REAL-TIME TOUCH DRAGGING IN 3D */}
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
                  {/* FRONT FACE */}
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

                  {/* BACK FACE */}
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
            {/* VIEW 3: PROGRAMMATIC 3D FLIP FORWARD (Next Spread) */}
            {/* ============================================================ */}
            {isFlipping && flipDirection === 'next' && (
              <div className="relative w-full h-full flex select-none">
                {/* BASE LEFT HALF */}
                <div className="relative w-1/2 h-full overflow-hidden">
                  <img
                    src={getPageImage(fromPage)}
                    alt="Left base current"
                    className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                  />
                </div>

                {/* BASE RIGHT HALF */}
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
                  <div className="book-leaf-front">
                    <img
                      src={getPageImage(fromPage)}
                      alt="Turning front"
                      className="absolute top-0 left-[-100%] w-[200%] max-w-none h-full object-cover object-right pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-black/35 anim-sheen-forward pointer-events-none" />
                  </div>
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
            {/* VIEW 4: PROGRAMMATIC 3D FLIP BACKWARD (Previous Spread) */}
            {/* ============================================================ */}
            {isFlipping && flipDirection === 'prev' && (
              <div className="relative w-full h-full flex select-none">
                {/* BASE LEFT HALF */}
                <div className="relative w-1/2 h-full overflow-hidden">
                  <img
                    src={getPageImage(toPage)}
                    alt="Left base destination"
                    className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/20 to-transparent anim-base-shadow pointer-events-none" />
                </div>

                {/* BASE RIGHT HALF */}
                <div className="relative w-1/2 h-full overflow-hidden">
                  <img
                    src={getPageImage(fromPage)}
                    alt="Right base current"
                    className="absolute top-0 left-[-100%] w-[200%] max-w-none h-full object-cover object-right pointer-events-none"
                  />
                </div>

                {/* 3D TURNING LEAF (-180deg -> 0deg) */}
                <div className="book-leaf-turning anim-flip-backward">
                  <div className="book-leaf-back">
                    <img
                      src={getPageImage(fromPage)}
                      alt="Turning back"
                      className="absolute top-0 left-0 w-[200%] max-w-none h-full object-cover object-left pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/40 to-black/35 anim-sheen-backward pointer-events-none" />
                  </div>
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

            {/* ============================================================ */}
            {/* D. 3D FRONT COVER HINGING ELEMENT (When opening from / closing to shelf) */}
            {/* ============================================================ */}
            {(isOpening || isClosing) && (
              <div
                className={`absolute top-0 left-1/2 w-1/2 h-full z-40 ${
                  isOpening ? 'anim-cover-open' : 'anim-cover-close'
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                }}
              >
                {/* FRONT FACE: Outside Saddle Leather with Polaroid label & elastic band */}
                <div
                  className="absolute inset-0 rounded-r-2xl overflow-hidden shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <div className="relative w-full h-full bg-gradient-to-br from-[#7e5538] via-[#65432a] to-[#4e321e] border-y border-r border-[#9d724f]/40 p-4 sm:p-6 flex flex-col items-center justify-center select-none">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                    <div className="absolute top-0 bottom-0 right-5 sm:right-7 w-3.5 sm:w-4 bg-[#2a1d13] shadow-[inset_0_0_3px_rgba(0,0,0,0.8),2px_0_6px_rgba(0,0,0,0.4)] pointer-events-none" />
                    <div className="relative z-10 w-[84%] max-w-[240px] bg-[#f5eedb] p-2.5 sm:p-3 rounded-xs shadow-xl border border-[#d8caa8] flex flex-col items-center transform -rotate-0.5">
                      <div className="w-full aspect-[4/3] rounded-2xs overflow-hidden bg-[#e0d6c3] shadow-inner mb-2">
                        <img
                          src="/journal/page-1.jpg"
                          alt="Cover art"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-['Caveat',cursive] text-xl sm:text-2xl font-bold text-[#352518] leading-tight text-center tracking-wide">
                        {journal.title || 'bhoi ka journal'}
                      </h3>
                      <p className="font-['Caveat',cursive] text-xs sm:text-sm font-semibold text-[#6d513a] text-center">
                        {pages.length} pages · 2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* BACK FACE: Inside Vintage Endpaper */}
                <div
                  className="absolute inset-0 rounded-l-2xl overflow-hidden shadow-inner bg-[#eadecc] border-y border-l border-[#c4b59e]/60"
                  style={{
                    transform: 'rotateY(180deg)',
                    WebkitTransform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <div className="relative w-full h-full p-6 flex flex-col justify-between">
                    <div className="opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px] absolute inset-0 pointer-events-none" />
                    <div className="font-['Caveat',cursive] text-sm text-[#7a6a57] italic">
                      Ex Libris · Bhoi Ka Song Tapes
                    </div>
                    <div className="font-['Caveat',cursive] text-xs text-[#9d8d7a] text-right">
                      Spread 01 · 2026
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* 3. PAPER FOR iOS BOTTOM ACTION BAR (The 4 Circular Buttons) */}
      {/* ============================================================ */}
      <footer
        className={`w-full pb-[max(1.2rem,env(safe-area-inset-bottom))] pt-2 flex items-center justify-center z-40 flex-shrink-0 transition-all duration-500 ease-out ${
          isOpening || isClosing ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Button 1: More / Details / Edit Journal */}
          <button
            onClick={() => setEditJournalModalOpen(true, journal.id)}
            className="paper-action-btn"
            title="Journal Options & Edit"
          >
            <MoreHorizontal className="w-5 h-5 text-[#2b2b2b]" />
          </button>

          {/* Button 2: Share / Export Spread */}
          <button
            onClick={handleShareSpread}
            className="paper-action-btn"
            title="Share / Save Spread Image"
          >
            <Share className="w-4.5 h-4.5 text-[#2b2b2b]" />
          </button>

          {/* Button 3: Delete Spread */}
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="paper-action-btn hover:text-red-600"
            title="Delete this Spread"
          >
            <Trash2 className="w-4.5 h-4.5 text-[#2b2b2b] hover:text-red-600 transition-colors" />
          </button>

          {/* Button 4: Add Spread / New Page */}
          <button
            onClick={() => setIsAddPageModalOpen(true)}
            className="paper-action-btn"
            title="Add New Spread (Sketch or Photo)"
          >
            <Plus className="w-5 h-5 text-[#2b2b2b]" />
          </button>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 4. GRID VIEW OVERVIEW MODAL (Tapping ⊞ in top left) */}
      {/* ============================================================ */}
      {isGridViewOpen && (
        <div
          className="absolute inset-0 z-50 bg-[#1e2233]/96 backdrop-blur-xl p-4 sm:p-8 flex flex-col justify-between animate-in fade-in duration-200"
          onClick={() => setIsGridViewOpen(false)}
        >
          <div className="flex items-center justify-between max-w-5xl w-full mx-auto pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white capitalize">{journal.title}</h2>
              <p className="text-xs text-white/60">Tap any spread to open</p>
            </div>
            <button
              onClick={() => setIsGridViewOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid of Spreads */}
          <div
            className="flex-1 overflow-y-auto py-6 max-w-5xl w-full mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {pages.map((p, idx) => {
              const isActive = currentPage === idx;
              return (
                <div
                  key={p.id || idx}
                  onClick={() => {
                    setCurrentPage(idx);
                    setActiveJournalPage(idx);
                    setIsGridViewOpen(false);
                  }}
                  className={`group relative aspect-[1.42/1] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:scale-[1.04] shadow-xl ${
                    isActive ? 'border-white ring-4 ring-white/30 scale-[1.02]' : 'border-white/20 hover:border-white/60'
                  }`}
                >
                  <img
                    src={getPageImage(idx)}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[11px] font-mono font-bold text-white">
                      #{idx + 1} {p.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsGridViewOpen(false);
                setIsAddPageModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1e2233] font-semibold text-xs shadow-lg hover:bg-neutral-100 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Spread</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. ADD NEW SPREAD MODAL (PaperCanvas Drawing or Photo URL) */}
      {/* ============================================================ */}
      {isAddPageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsAddPageModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#24293c] border border-white/20 rounded-2xl shadow-2xl p-5 text-white flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAddMode('draw')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    addMode === 'draw'
                      ? 'bg-white text-[#24293c]'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Hand Draw Canvas</span>
                </button>
                <button
                  onClick={() => setAddMode('photo')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    addMode === 'photo'
                      ? 'bg-white text-[#24293c]'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Photo / Image URL</span>
                </button>
              </div>
              <button
                onClick={() => setIsAddPageModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Spread Title (e.g. Midnight Sketches)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/30 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50"
              />
            </div>

            {addMode === 'draw' ? (
              <div className="flex-1 min-h-[340px] rounded-xl overflow-hidden border border-white/15">
                <PaperCanvas onSave={handleSaveDrawnPage} />
              </div>
            ) : (
              <div className="py-4 space-y-3">
                <p className="text-xs text-white/70">
                  Enter an image URL to insert as a new double-spread sketchbook page:
                </p>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or /journal/page-1.jpg"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                />
                {newPhotoUrl && (
                  <div className="aspect-[1.42/1] max-h-48 rounded-lg overflow-hidden border border-white/20 bg-black/40">
                    <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSavePhotoPage}
                    disabled={!newPhotoUrl.trim()}
                    className="px-5 py-2 rounded-full bg-white text-[#24293c] font-semibold text-xs disabled:opacity-40 hover:bg-neutral-100 active:scale-95 transition-all shadow-md"
                  >
                    Add Spread
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. DELETE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#24293c] border border-white/20 rounded-2xl p-6 text-white text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Delete this spread?</h3>
            <p className="text-xs text-white/70 mb-5">
              This will remove Spread #{currentPage + 1} from {journal.title}.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePage}
                className="flex-1 py-2 rounded-full bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalReaderModal;