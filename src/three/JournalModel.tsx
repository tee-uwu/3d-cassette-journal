import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Journal } from '../types';
import { getBlobTexture } from './blobTexture';

interface JournalModelProps {
  journal: Journal;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (e?: any) => void;
  onPointerOver?: (e?: any) => void;
  onPointerOut?: (e?: any) => void;
}

export const JournalModel: React.FC<JournalModelProps> = ({
  journal,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  // Dimensions from Tape shelf specification: 1.55 x 2.05 x 0.26
  const baseColor = journal.cover_color || '#8a6f55';
  const darkSpineColor = useMemo(() => {
    return new THREE.Color(baseColor).multiplyScalar(0.7);
  }, [baseColor]);

  const coverMaterial = useMemo(() => {
    if (journal.cover_material === 'crystal') {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(baseColor),
        transmission: 0.85,
        opacity: 0.95,
        transparent: true,
        roughness: 0.12,
        ior: 1.5,
        thickness: 0.4,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      roughness: journal.cover_material === 'matte' ? 0.9 : journal.cover_material === 'linen' ? 0.85 : 0.7,
    });
  }, [baseColor, journal.cover_material]);

  const spineMaterial = useMemo(() => {
    if (journal.cover_material === 'crystal') {
      return new THREE.MeshPhysicalMaterial({
        color: darkSpineColor,
        transmission: 0.7,
        opacity: 0.9,
        transparent: true,
        roughness: 0.2,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: darkSpineColor,
      roughness: 0.8,
    });
  }, [darkSpineColor, journal.cover_material]);

  const paperPagesMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f1e7d1',
      roughness: 0.9,
    });
  }, []);

  const bandMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(journal.elastic_color || '#3b2f25'),
      roughness: 0.7,
    });
  }, [journal.elastic_color]);

  const blobShadowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: getBlobTexture(),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
  }, []);

  // Cover label canvas (400x400)
  const coverTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const render = (img?: HTMLImageElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f4ecda';
      ctx.fillRect(0, 0, 400, 400);

      const hasImg = img && img.naturalWidth;
      if (hasImg) {
        const w = 360;
        const h = 270;
        const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const iw = img.naturalWidth * k;
        const ih = img.naturalHeight * k;
        ctx.save();
        ctx.beginPath();
        ctx.rect(20, 20, w, h);
        ctx.clip();
        ctx.drawImage(img, 20 + (w - iw) / 2, 20 + (h - ih) / 2, iw, ih);
        ctx.restore();
      } else {
        ctx.fillStyle = 'rgba(60,45,30,0.12)';
        ctx.fillRect(20, 20, 360, 270);
      }

      ctx.fillStyle = '#3b2f25';
      ctx.textAlign = 'center';
      ctx.font = '700 56px Caveat, "Anek Bangla", "Noto Sans Bengali", "Segoe Print", cursive, sans-serif';
      ctx.fillText(journal.title, 200, 350, 340);
      ctx.font = '700 30px Caveat, "Anek Bangla", "Noto Sans Bengali", cursive, sans-serif';
      const pageCount = journal.pages?.length || 7;
      const dateText = `${pageCount} pages · 2026`;
      ctx.fillText(dateText, 200, 385);

      texture.needsUpdate = true;
    };

    const firstPageBg = journal.cover_photo || journal.pages?.[0]?.photo_url || journal.pages?.[0]?.sketch_data;
    if (firstPageBg && (firstPageBg.startsWith('data:') || firstPageBg.startsWith('http') || firstPageBg.startsWith('/'))) {
      const img = new Image();
      img.onload = () => render(img);
      img.src = firstPageBg;
    } else {
      render();
    }

    return texture;
  }, [journal.title, journal.pages, journal.cover_photo]);

  const labelMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: coverTexture,
      roughness: 0.9,
    });
  }, [coverTexture]);

  return (
    <group
      onClick={onClick}
      onPointerOver={(e) => {
        document.body.style.cursor = 'pointer';
        onPointerOver?.(e);
      }}
      onPointerOut={(e) => {
        document.body.style.cursor = 'auto';
        onPointerOut?.(e);
      }}
    >
      {/* 1. Main Cover: 1.55 x 2.05 x 0.26 */}
      <mesh material={coverMaterial}>
        <boxGeometry args={[1.55, 2.05, 0.26]} />
      </mesh>

      {/* 2. Page Block: 1.52 x 1.97 x 0.2 at [0.03, 0, 0] */}
      <mesh position={[0.03, 0, 0]} material={paperPagesMaterial}>
        <boxGeometry args={[1.52, 1.97, 0.2]} />
      </mesh>

      {/* 3. Spine: 0.1 x 2.07 x 0.28 at [-0.73, 0, 0] */}
      <mesh position={[-0.73, 0, 0]} material={spineMaterial}>
        <boxGeometry args={[0.1, 2.07, 0.28]} />
      </mesh>

      {/* 4. Elastic Band: 0.05 x 2.07 x 0.275 at [0.55, 0, 0] */}
      <mesh position={[0.55, 0, 0]} material={bandMaterial}>
        <boxGeometry args={[0.05, 2.07, 0.275]} />
      </mesh>

      {/* 5. Cover Label: 1.2 x 1.2 at [-0.08, 0.18, 0.132] */}
      <mesh position={[-0.08, 0.18, 0.132]} material={labelMaterial}>
        <planeGeometry args={[1.2, 1.2]} />
      </mesh>

      {/* 6. Soft Blob Shadow: 2.8 x 3.3 at [0.08, -0.12, -0.22] */}
      <mesh position={[0.08, -0.12, -0.22]} material={blobShadowMaterial}>
        <planeGeometry args={[2.8, 3.3]} />
      </mesh>
    </group>
  );
};
