import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Lighting } from './Lighting';
import { CameraController } from './CameraController';
import { CassetteCarousel } from './CassetteCarousel';
import { JournalCarousel } from './JournalCarousel';
import { useTapeStore } from '../stores/useTapeStore';
import { getBlobTexture } from './blobTexture';

const PhysicalShelf: React.FC = () => {
  const { shelfMaterial } = useTapeStore();

  const material = useMemo(() => {
    if (shelfMaterial === 'crystal-glass') {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xe8f6fd),
        transmission: 0.92,
        opacity: 0.88,
        transparent: true,
        roughness: 0.06,
        ior: 1.52,
        thickness: 0.5,
      });
    }
    if (shelfMaterial === 'dark-wood') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x35281f),
        roughness: 0.75,
      });
    }
    if (shelfMaterial === 'concrete') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x94938e),
        roughness: 0.9,
      });
    }
    // 'light-wood'
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xdbc8b2),
      roughness: 0.7,
    });
  }, [shelfMaterial]);

  return (
    <group position={[0, -1.68, -0.7]}>
      {/* Floating shelf slab */}
      <mesh material={material}>
        <boxGeometry args={[16, 0.14, 3.2]} />
      </mesh>
    </group>
  );
};

const GroundShelfShadow: React.FC = () => {
  const groundMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: getBlobTexture(),
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.76, -0.8]}
      material={groundMaterial}
    >
      <planeGeometry args={[14, 3.4]} />
    </mesh>
  );
};

export const SpatialEnvironment: React.FC = () => {
  const { activeSection, setSelectedTapeId, setSelectedJournalId } = useTapeStore();

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        camera={{ position: [0, 0.4, 10.5], fov: 32 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onPointerMissed={() => {
          setSelectedTapeId(null);
          setSelectedJournalId(null);
        }}
      >
        <Suspense fallback={null}>
          <Lighting />
          <CameraController />

          {activeSection === 'cassettes' ? (
            <CassetteCarousel />
          ) : (
            <JournalCarousel />
          )}

          {/* Physical floating shelf (only on cassette tape shelf) and shadow */}
          {activeSection === 'cassettes' && <PhysicalShelf />}
          <GroundShelfShadow />
        </Suspense>
      </Canvas>
    </div>
  );
};
