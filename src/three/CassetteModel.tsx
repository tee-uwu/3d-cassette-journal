import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Tape } from '../types';
import { createCassetteLabelTexture } from './CassetteLabelTexture';
import { getBlobTexture } from './blobTexture';

interface CassetteModelProps {
  tape: Tape;
  isSelected?: boolean;
  isHovered?: boolean;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  onClick?: (e?: any) => void;
  onPointerOver?: (e?: any) => void;
  onPointerOut?: (e?: any) => void;
}

export const CassetteModel: React.FC<CassetteModelProps> = ({
  tape,
  isPlaying = false,
  currentTime = 0,
  duration = 180,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const leftHubRef = useRef<THREE.Group>(null);
  const rightHubRef = useRef<THREE.Group>(null);
  const leftPackRef = useRef<THREE.Mesh>(null);
  const rightPackRef = useRef<THREE.Mesh>(null);

  // Shell Material: High-Gloss Acrylic with Transmission
  const shellMaterial = useMemo(() => {
    const rawColor = tape.shell_color || tape.label_color || '#ffffff';
    const isSolid = tape.shell_type === 'solid';
    const isFrosted = tape.shell_type === 'frosted';

    if (isSolid) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(rawColor),
        roughness: 0.45,
        metalness: 0.05,
      });
    }

    const tint = new THREE.Color(rawColor).lerp(new THREE.Color('#ffffff'), 0.5);

    return new THREE.MeshPhysicalMaterial({
      color: tint,
      transparent: true,
      opacity: isFrosted ? 0.76 : 0.65,
      roughness: isFrosted ? 0.32 : 0.12,
      clearcoat: isFrosted ? 0.3 : 0.85,
      clearcoatRoughness: 0.15,
      ior: 1.49,
      depthWrite: false,
    });
  }, [tape.shell_color, tape.label_color, tape.shell_type]);

  // Label Texture & Material
  const labelTexture = useMemo(() => {
    return createCassetteLabelTexture({
      title: tape.title,
      artist: tape.artist,
      date: tape.created_at ? new Date(tape.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Side A',
      subtitle: tape.subtitle,
      labelColor: tape.label_color || tape.shell_color || '#d8a25e',
      artworkUrl: tape.artwork_path,
      labelStyle: tape.label_style,
    });
  }, [tape.title, tape.artist, tape.created_at, tape.subtitle, tape.label_color, tape.shell_color, tape.artwork_path, tape.label_style]);

  const labelMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.88,
    });
  }, [labelTexture]);

  // Window Gauge Texture with tick marks
  const windowGaugeTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '700 20px "Inter", monospace, sans-serif';
    ctx.textAlign = 'center';

    const ticks = [
      { x: 100, label: '100' },
      { x: 178, label: '·' },
      { x: 256, label: '50' },
      { x: 334, label: '·' },
      { x: 412, label: '0' },
    ];
    ticks.forEach((t) => {
      ctx.fillText(t.label, t.x, 62);
      ctx.fillRect(t.x - 1, 72, 2, 10);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  const windowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: windowGaugeTexture,
      color: 0x3d3027,
      transparent: true,
      opacity: 0.42,
    });
  }, [windowGaugeTexture]);

  // Foot / Head Block Material
  const footMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#42372e',
      roughness: 0.55,
    });
  }, []);

  // Screws Material
  const screwMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#c4b8a5',
      metalness: 0.7,
      roughness: 0.3,
    });
  }, []);

  // Brass Rollers Material
  const rollerMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#d4af37',
      metalness: 0.85,
      roughness: 0.2,
    });
  }, []);

  // Copper pressure pad
  const padMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#a65b38',
      roughness: 0.8,
    });
  }, []);

  // Spools & Magnetic Tape Ribbon
  const tapePackMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#241b17', // Dark ferric oxide brown
      roughness: 0.4,
      metalness: 0.15,
    });
  }, []);

  const reelHubMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f5edd8', // Vintage ivory cog
      roughness: 0.35,
      metalness: 0.1,
    });
  }, []);

  const reelHoleMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#4a3d32',
    });
  }, []);

  const reelToothAccentMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#e63946', // Classic Maxell/TDK red alignment tooth
    });
  }, []);

  // Soft Blob Shadow
  const blobShadowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: getBlobTexture(),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
  }, []);

  // Continuous reel spin & dynamic tape transfer during audio playback
  useFrame((_, delta) => {
    if (isPlaying) {
      const spin = delta * 3.5;
      if (leftHubRef.current) leftHubRef.current.rotation.z -= spin;
      if (rightHubRef.current) rightHubRef.current.rotation.z -= spin;
    }

    if (duration > 0 && leftPackRef.current && rightPackRef.current) {
      const p = isPlaying ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
      const leftScale = 1.0 - 0.38 * p;
      const rightScale = 0.62 + 0.38 * p;
      leftPackRef.current.scale.set(leftScale, leftScale, 1);
      rightPackRef.current.scale.set(rightScale, rightScale, 1);
    }
  });

  return (
    <group
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* 1. Main Transparent Acrylic Cassette Shell: 2.2 x 1.4 x 0.22 */}
      <mesh material={shellMaterial}>
        <boxGeometry args={[2.2, 1.4, 0.22]} />
      </mesh>

      {/* 2. Textured Finger-Grip Ribs on Left & Right sides */}
      {[-0.32, -0.2, -0.08, 0.04, 0.16, 0.28].map((y, idx) => (
        <React.Fragment key={idx}>
          <mesh position={[-1.102, y, 0]} material={footMaterial}>
            <boxGeometry args={[0.015, 0.05, 0.16]} />
          </mesh>
          <mesh position={[1.102, y, 0]} material={footMaterial}>
            <boxGeometry args={[0.015, 0.05, 0.16]} />
          </mesh>
        </React.Fragment>
      ))}

      {/* 3. Top Write-Protect Notches */}
      <mesh position={[-0.85, 0.69, 0]} material={footMaterial}>
        <boxGeometry args={[0.16, 0.03, 0.18]} />
      </mesh>
      <mesh position={[0.85, 0.69, 0]} material={footMaterial}>
        <boxGeometry args={[0.16, 0.03, 0.18]} />
      </mesh>

      {/* 4. Paper Label: 1.9 x 0.62 at [0, 0.36, 0.113] */}
      <mesh position={[0, 0.36, 0.113]} material={labelMaterial}>
        <planeGeometry args={[1.9, 0.62]} />
      </mesh>

      {/* 5. Center Transparent Window with Gauge Marks: 1.5 x 0.4 */}
      <mesh position={[0, -0.2, 0.112]} material={windowMaterial}>
        <planeGeometry args={[1.5, 0.4]} />
      </mesh>

      {/* 6. Bottom Head/Foot Block: 1.4 x 0.24 x 0.24 at [0, -0.62, 0] */}
      <mesh position={[0, -0.62, 0]} material={footMaterial}>
        <boxGeometry args={[1.4, 0.24, 0.24]} />
      </mesh>

      {/* 7. Felt Pressure Pad & Copper Spring at Head Opening */}
      <mesh position={[0, -0.64, 0.114]} material={padMaterial}>
        <boxGeometry args={[0.14, 0.06, 0.02]} />
      </mesh>

      {/* 8. Dual Drive Capstan Insertion Holes */}
      <mesh position={[-0.65, -0.6, 0.113]} rotation={[Math.PI / 2, 0, 0]} material={reelHoleMaterial}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
      </mesh>
      <mesh position={[0.65, -0.6, 0.113]} rotation={[Math.PI / 2, 0, 0]} material={reelHoleMaterial}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
      </mesh>

      {/* 9. Magnetic Tape Path Ribbon along the bottom: 1.3 x 0.08 */}
      <mesh position={[0, -0.48, 0.02]} material={tapePackMaterial}>
        <planeGeometry args={[1.3, 0.08]} />
      </mesh>

      {/* 10. Dual Brass Rollers at bottom corners */}
      <mesh position={[-0.78, -0.44, 0]} rotation={[Math.PI / 2, 0, 0]} material={rollerMaterial}>
        <cylinderGeometry args={[0.06, 0.06, 0.14, 16]} />
      </mesh>
      <mesh position={[0.78, -0.44, 0]} rotation={[Math.PI / 2, 0, 0]} material={rollerMaterial}>
        <cylinderGeometry args={[0.06, 0.06, 0.14, 16]} />
      </mesh>

      {/* 11. Four Corner Screws */}
      {[
        [-1.04, 0.6],
        [1.04, 0.6],
        [-1.04, -0.6],
        [1.04, -0.6],
      ].map(([sx, sy], i) => (
        <mesh
          key={i}
          position={[sx, sy, 0.115]}
          rotation={[Math.PI / 2, 0, 0]}
          material={screwMaterial}
        >
          <cylinderGeometry args={[0.045, 0.045, 0.03, 12]} />
        </mesh>
      ))}

      {/* 12. Left Reel Assembly at [-0.5, -0.2, 0] */}
      <group position={[-0.5, -0.2, 0]}>
        {/* Left Tape Pack */}
        <mesh ref={leftPackRef} rotation={[Math.PI / 2, 0, 0]} material={tapePackMaterial}>
          <cylinderGeometry args={[0.24, 0.24, 0.07, 32]} />
        </mesh>
        {/* Left Hub & Hole (spin together) */}
        <group ref={leftHubRef}>
          {/* 6-sided hexagonal cog hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={reelHubMaterial}>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 6]} />
          </mesh>
          {/* High-contrast Red indicator tooth */}
          <mesh position={[0.08, 0, 0.052]} material={reelToothAccentMaterial}>
            <boxGeometry args={[0.04, 0.02, 0.01]} />
          </mesh>
          {/* Center 6-sided hole */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={reelHoleMaterial}>
            <cylinderGeometry args={[0.06, 0.06, 0.11, 6]} />
          </mesh>
        </group>
      </group>

      {/* 13. Right Reel Assembly at [0.5, -0.2, 0] */}
      <group position={[0.5, -0.2, 0]}>
        {/* Right Tape Pack */}
        <mesh ref={rightPackRef} rotation={[Math.PI / 2, 0, 0]} material={tapePackMaterial}>
          <cylinderGeometry args={[0.24, 0.24, 0.07, 32]} />
        </mesh>
        {/* Right Hub & Hole (spin together) */}
        <group ref={rightHubRef}>
          {/* 6-sided hexagonal cog hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={reelHubMaterial}>
            <cylinderGeometry args={[0.13, 0.13, 0.1, 6]} />
          </mesh>
          {/* High-contrast Red indicator tooth */}
          <mesh position={[0.08, 0, 0.052]} material={reelToothAccentMaterial}>
            <boxGeometry args={[0.04, 0.02, 0.01]} />
          </mesh>
          {/* Center 6-sided hole */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={reelHoleMaterial}>
            <cylinderGeometry args={[0.06, 0.06, 0.11, 6]} />
          </mesh>
        </group>
      </group>

      {/* 14. Soft Blob Shadow underneath cassette */}
      <mesh position={[0.08, -0.14, -0.2]} material={blobShadowMaterial}>
        <planeGeometry args={[3.5, 2.5]} />
      </mesh>
    </group>
  );
};
