import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTapeStore } from '../stores/useTapeStore';
import { JournalModel } from './JournalModel';
import type { Journal } from '../types';

function layout(d: number, n: number) {
  const a = Math.abs(d);
  const s = Math.sign(d);
  const sp = n < 3 ? 2.1 : 1.3;
  return {
    x: s * (Math.min(a, 1) * sp + Math.max(a - 1, 0) * 0.85),
    y: -a * a * 0.045,
    z: -Math.min(a, 5) * 0.75,
    ry: -s * Math.min(a, 2) * 0.3,
    sc: 1 + 0.16 * Math.max(0, 1 - a) - Math.min(a, 3) * 0.035,
  };
}

export const JournalCarousel: React.FC = () => {
  const {
    journals,
    activeJournalIndex,
    selectedJournalId,
    setActiveJournalIndex,
    setSelectedJournalId,
  } = useTapeStore();

  const { gl } = useThree();

  const posRef = useRef(activeJournalIndex);
  const targetPosRef = useRef(activeJournalIndex);
  const [displayPos, setDisplayPos] = useState(activeJournalIndex);

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

  useEffect(() => {
    if (!pointerState.current.isDown) {
      targetPosRef.current = activeJournalIndex;
    }
  }, [activeJournalIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        const next = Math.min(journals.length - 1, activeJournalIndex + 1);
        setActiveJournalIndex(next);
        targetPosRef.current = next;
      } else if (e.key === 'ArrowLeft') {
        const prev = Math.max(0, activeJournalIndex - 1);
        setActiveJournalIndex(prev);
        targetPosRef.current = prev;
      } else if (e.key === 'Escape') {
        setSelectedJournalId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeJournalIndex, journals.length, setActiveJournalIndex, setSelectedJournalId]);

  // Smooth inertial dragging
  useEffect(() => {
    const dom = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
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
      if (!p.isDown) return;

      const dx = e.clientX - p.lastX;
      const now = performance.now();
      const dt = Math.max(1, now - p.lastTime);

      p.moved = Math.hypot(e.clientX - p.startX, e.clientY - p.startY);

      const unit = window.innerWidth < 700 ? 150 : 230;
      targetPosRef.current = THREE.MathUtils.clamp(
        targetPosRef.current - dx / unit,
        -0.4,
        journals.length - 0.6
      );

      p.velocity = THREE.MathUtils.lerp(p.velocity, -dx / unit / dt, 0.4);
      p.lastX = e.clientX;
      p.lastTime = now;
    };

    const handlePointerUp = () => {
      const p = pointerState.current;
      if (!p.isDown) return;
      p.isDown = false;

      if (p.moved >= 6) {
        const target = Math.round(targetPosRef.current + p.velocity * 220);
        const clamped = THREE.MathUtils.clamp(target, 0, journals.length - 1);
        targetPosRef.current = clamped;
        setActiveJournalIndex(clamped);
      } else {
        const clamped = THREE.MathUtils.clamp(Math.round(targetPosRef.current), 0, journals.length - 1);
        targetPosRef.current = clamped;
        setActiveJournalIndex(clamped);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      targetPosRef.current = THREE.MathUtils.clamp(
        targetPosRef.current + delta * 0.0035,
        0,
        journals.length - 1
      );

      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      wheelTimeout.current = window.setTimeout(() => {
        const clamped = THREE.MathUtils.clamp(Math.round(targetPosRef.current), 0, journals.length - 1);
        targetPosRef.current = clamped;
        setActiveJournalIndex(clamped);
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
  }, [gl, journals.length, setActiveJournalIndex]);

  useFrame((_, delta) => {
    const dampSpeed = pointerState.current.isDown ? 18 : 8;
    posRef.current = THREE.MathUtils.damp(posRef.current, targetPosRef.current, dampSpeed, delta);
    setDisplayPos(posRef.current);
  });

  return (
    <group name="journal-collection">
      {journals.map((journal, index) => {
        const isSelected = selectedJournalId === journal.id;

        return (
          <JournalItemWrapper
            key={journal.id}
            journal={journal}
            index={index}
            carouselPos={displayPos}
            totalJournals={journals.length}
            isSelected={isSelected}
            onClick={() => {
              if (pointerState.current.moved >= 6) return;
              if (activeJournalIndex !== index) {
                targetPosRef.current = index;
                setActiveJournalIndex(index);
              } else {
                setSelectedJournalId(isSelected ? null : journal.id);
              }
            }}
          />
        );
      })}
    </group>
  );
};

interface JournalItemWrapperProps {
  journal: Journal;
  index: number;
  carouselPos: number;
  totalJournals: number;
  isSelected: boolean;
  onClick: () => void;
}

const JournalItemWrapper: React.FC<JournalItemWrapperProps> = ({
  journal,
  index,
  carouselPos,
  totalJournals,
  isSelected,
  onClick,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const naturalRz = Math.sin(index * 12.9) * 0.05;
  const naturalYo = Math.sin(index * 4.7) * 0.07;
  const focusFactor = useRef(0);

  useFrame((_, delta) => {
    if (!rootRef.current) return;

    focusFactor.current = THREE.MathUtils.damp(focusFactor.current, isSelected ? 1 : 0, 7, delta);

    const d = index - carouselPos;
    const L = layout(d, totalJournals);
    const act = Math.max(0, 1 - Math.abs(d));
    const f = focusFactor.current;

    let targetX = L.x;
    let targetY = L.y + naturalYo + act * f * 0.5;
    let targetZ = L.z + act * f * 2.6 - (1 - act) * f * 1.6;

    let targetRx = -0.07 * act * (1 - f);
    let targetRy = L.ry;
    let targetRz = naturalRz * (1 - act * 0.75) * (1 - f);

    let targetSc = L.sc * (1 + act * f * 0.32);

    rootRef.current.position.x = THREE.MathUtils.damp(rootRef.current.position.x, targetX, 8, delta);
    rootRef.current.position.y = THREE.MathUtils.damp(rootRef.current.position.y, targetY, 8, delta);
    rootRef.current.position.z = THREE.MathUtils.damp(rootRef.current.position.z, targetZ, 8, delta);

    rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, targetRx, 8, delta);
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, targetRy, 8, delta);
    rootRef.current.rotation.z = THREE.MathUtils.damp(rootRef.current.rotation.z, targetRz, 8, delta);

    const s = THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, targetSc), 8, delta);
    rootRef.current.scale.set(s, s, s);

    rootRef.current.visible = Math.abs(d) < 6.5;
  });

  return (
    <group ref={rootRef}>
      <JournalModel
        journal={journal}
        isSelected={isSelected}
        onClick={onClick}
      />
    </group>
  );
};
