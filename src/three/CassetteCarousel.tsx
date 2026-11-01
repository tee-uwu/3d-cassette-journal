import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTapeStore } from '../stores/useTapeStore';
import { CassetteItem } from './CassetteItem';

export const CassetteCarousel: React.FC = () => {
  const {
    tapes,
    activeTapeIndex,
    selectedTapeId,
    playingTapeId,
    hoveredTapeId,
    mode,
    isPlaying,
    currentTime,
    duration,
    setActiveTapeIndex,
    setSelectedTapeId,
    setHoveredTapeId,
  } = useTapeStore();

  const { gl } = useThree();

  // Continuous floating position for buttery smooth dragging
  const posRef = useRef(activeTapeIndex);
  const targetPosRef = useRef(activeTapeIndex);
  const [displayPos, setDisplayPos] = useState(activeTapeIndex);

  const pointerState = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    moved: number;
    isDown: boolean;
  }>({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    moved: 0,
    isDown: false,
  });

  const wheelTimeout = useRef<number | null>(null);

  // Sync target when activeTapeIndex changes from UI buttons or keyboard
  useEffect(() => {
    if (!pointerState.current.isDown) {
      targetPosRef.current = activeTapeIndex;
    }
  }, [activeTapeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'carousel') return;
      if (e.key === 'ArrowRight') {
        const next = Math.min(tapes.length - 1, activeTapeIndex + 1);
        setActiveTapeIndex(next);
        targetPosRef.current = next;
      } else if (e.key === 'ArrowLeft') {
        const prev = Math.max(0, activeTapeIndex - 1);
        setActiveTapeIndex(prev);
        targetPosRef.current = prev;
      } else if (e.key === 'Escape') {
        setSelectedTapeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, activeTapeIndex, tapes.length, setActiveTapeIndex, setSelectedTapeId]);

  // Inertial smooth dragging & wheel gestures on canvas
  useEffect(() => {
    const dom = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      if (mode !== 'carousel') return;
      pointerState.current = {
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastTime: performance.now(),
        velocity: 0,
        moved: 0,
        isDown: true,
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const p = pointerState.current;
      if (!p.isDown || mode !== 'carousel') return;

      const dx = e.clientX - p.lastX;
      const now = performance.now();
      const dt = Math.max(1, now - p.lastTime);

      p.moved = Math.hypot(e.clientX - p.startX, e.clientY - p.startY);

      // Sensitivity unit based on viewport width
      const unit = window.innerWidth < 700 ? 150 : 230;
      targetPosRef.current = THREE.MathUtils.clamp(
        targetPosRef.current - dx / unit,
        -0.4,
        tapes.length - 0.6
      );

      p.velocity = THREE.MathUtils.lerp(p.velocity, -dx / unit / dt, 0.4);
      p.lastX = e.clientX;
      p.lastTime = now;
    };

    const handlePointerUp = () => {
      const p = pointerState.current;
      if (!p.isDown) return;
      p.isDown = false;

      if (mode === 'carousel') {
        if (p.moved >= 6) {
          // Dragged with inertia: snap to predicted end position
          const target = Math.round(targetPosRef.current + p.velocity * 220);
          const clamped = THREE.MathUtils.clamp(target, 0, tapes.length - 1);
          targetPosRef.current = clamped;
          setActiveTapeIndex(clamped);
        } else {
          // Minor nudge: snap to nearest
          const clamped = THREE.MathUtils.clamp(Math.round(targetPosRef.current), 0, tapes.length - 1);
          targetPosRef.current = clamped;
          setActiveTapeIndex(clamped);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (mode !== 'carousel') return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      targetPosRef.current = THREE.MathUtils.clamp(
        targetPosRef.current + delta * 0.0035,
        0,
        tapes.length - 1
      );

      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      wheelTimeout.current = window.setTimeout(() => {
        const clamped = THREE.MathUtils.clamp(Math.round(targetPosRef.current), 0, tapes.length - 1);
        targetPosRef.current = clamped;
        setActiveTapeIndex(clamped);
      }, 120);
    };

    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dom.removeEventListener('wheel', handleWheel);
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, [gl, mode, tapes.length, setActiveTapeIndex]);

  // Frame update for continuous position damping
  useFrame((_, delta) => {
    if (mode === 'carousel') {
      const dampSpeed = pointerState.current.isDown ? 18 : 8;
      posRef.current = THREE.MathUtils.damp(posRef.current, targetPosRef.current, dampSpeed, delta);
      setDisplayPos(posRef.current);
    }
  });

  return (
    <group name="cassette-collection">
      {tapes.map((tape, index) => {
        const isSelected = selectedTapeId === tape.id;
        const isHovered = hoveredTapeId === tape.id;
        const isTapePlaying = isPlaying && (tape.id === playingTapeId || (!playingTapeId && activeTapeIndex === index));

        return (
          <CassetteItem
            key={tape.id}
            tape={tape}
            index={index}
            carouselPos={displayPos}
            totalTapes={tapes.length}
            mode={mode}
            isSelected={isSelected}
            isHovered={isHovered}
            isPlaying={isTapePlaying}
            currentTime={currentTime}
            duration={duration}
            onSelect={() => {
              if (pointerState.current.moved >= 6) return;
              if (activeTapeIndex !== index) {
                targetPosRef.current = index;
                setActiveTapeIndex(index);
              } else {
                setSelectedTapeId(isSelected ? null : tape.id);
              }
            }}
            onHover={(h) => setHoveredTapeId(h ? tape.id : null)}
          />
        );
      })}
    </group>
  );
};
