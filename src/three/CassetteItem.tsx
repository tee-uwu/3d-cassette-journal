import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Tape, AppMode } from '../types';
import { CassetteModel } from './CassetteModel';

interface CassetteItemProps {
  tape: Tape;
  index: number;
  carouselPos: number;
  totalTapes: number;
  mode: AppMode;
  isSelected: boolean;
  isHovered: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}

// Pure 3D carousel layout function from Tape shelf specification
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

export const CassetteItem: React.FC<CassetteItemProps> = ({
  tape,
  index,
  carouselPos,
  totalTapes,
  mode,
  isSelected,
  isHovered,
  isPlaying,
  currentTime,
  duration,
  onSelect,
  onHover,
}) => {
  const rootRef = useRef<THREE.Group>(null);

  // Per-tape natural human slant and vertical micro-variation
  const naturalRz = Math.sin(index * 12.9) * 0.05;
  const naturalYo = Math.sin(index * 4.7) * 0.07;

  // Animation state factors
  const hoverFactor = useRef(0);
  const focusFactor = useRef(0);
  const freeFactor = useRef(mode === 'spatial' ? 1 : 0);
  const enterFactor = useRef(1); // entrance visibility

  useFrame((_, delta) => {
    if (!rootRef.current) return;

    // Smoothly interpolate animation factors
    hoverFactor.current = THREE.MathUtils.damp(hoverFactor.current, isHovered ? 1 : 0, 8, delta);
    focusFactor.current = THREE.MathUtils.damp(focusFactor.current, isSelected ? 1 : 0, 7, delta);
    freeFactor.current = THREE.MathUtils.damp(freeFactor.current, mode === 'spatial' ? 1 : 0, 6, delta);

    const d = index - carouselPos;
    const L = layout(d, totalTapes);
    const act = Math.max(0, 1 - Math.abs(d));
    const f = focusFactor.current;
    const h = hoverFactor.current;
    const m = freeFactor.current;
    const e = enterFactor.current;

    // Carousel target coordinate
    const c = {
      x: L.x,
      y: L.y + naturalYo,
      z: L.z + h * 0.45,
      ry: L.ry,
      rz: naturalRz * (1 - act * 0.75),
      rx: -0.07 * act,
      sc: L.sc * (1 + h * 0.05),
    };

    // When focused (selected): zoom towards camera, center, face squarely
    c.z += act * f * 2.6 - (1 - act) * f * 1.6;
    c.y += act * f * 0.5;
    c.sc *= 1 + act * f * 0.32;
    c.rx *= 1 - f;
    c.rz *= 1 - f;

    // Free spatial arrangement target
    const defaultFreeX = ((index % 4) - 1.5) * 2.7;
    const defaultFreeY = 0.9 - Math.floor(index / 4) * 1.7;
    const freeX = tape.position_x !== 0 ? tape.position_x : defaultFreeX;
    const freeY = tape.position_y !== 0 ? tape.position_y : defaultFreeY;
    const freeZ = tape.position_z || 0;
    const freeRz = tape.rotation_z !== 0 ? tape.rotation_z : Math.sin(index * 7.1) * 0.06;

    const F = {
      x: freeX,
      y: freeY,
      z: freeZ + h * 0.45,
      ry: tape.rotation_y || 0,
      rz: freeRz,
      rx: tape.rotation_x || 0,
      sc: tape.scale || 1,
    };

    // Lerp between carousel and free mode
    const targetX = THREE.MathUtils.lerp(c.x, F.x, m);
    const targetY = THREE.MathUtils.lerp(c.y, F.y, m) - (1 - e) * 1.4;
    const targetZ = THREE.MathUtils.lerp(c.z, F.z, m);

    const targetRx = THREE.MathUtils.lerp(c.rx, F.rx, m);
    const targetRy = THREE.MathUtils.lerp(c.ry, F.ry, m);
    const targetRz = THREE.MathUtils.lerp(c.rz, F.rz, m) + (1 - e) * naturalRz * 5;

    const targetSc = THREE.MathUtils.lerp(c.sc, F.sc, m) * (0.86 + 0.14 * e);

    // Apply smooth damping
    rootRef.current.position.x = THREE.MathUtils.damp(rootRef.current.position.x, targetX, 8, delta);
    rootRef.current.position.y = THREE.MathUtils.damp(rootRef.current.position.y, targetY, 8, delta);
    rootRef.current.position.z = THREE.MathUtils.damp(rootRef.current.position.z, targetZ, 8, delta);

    rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, targetRx, 8, delta);
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, targetRy, 8, delta);
    rootRef.current.rotation.z = THREE.MathUtils.damp(rootRef.current.rotation.z, targetRz, 8, delta);

    const currentScale = THREE.MathUtils.damp(rootRef.current.scale.x, Math.max(0.001, targetSc), 8, delta);
    rootRef.current.scale.setScalar(currentScale);

    // Visibility clipping for performance on large collections
    rootRef.current.visible = e > 0.004 && (m > 0.01 || Math.abs(d) < 6.5);
  });

  return (
    <group ref={rootRef}>
      <CassetteModel
        tape={tape}
        isSelected={isSelected}
        isHovered={isHovered}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onClick={onSelect}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      />
    </group>
  );
};
