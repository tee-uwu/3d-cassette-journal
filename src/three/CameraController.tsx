import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTapeStore } from '../stores/useTapeStore';

export const CameraController: React.FC = () => {
  const { mode, selectedTapeId, selectedJournalId } = useTapeStore();
  const { camera, size } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 10.5));
  const targetLookAt = useRef(new THREE.Vector3(0, -0.5, 0));

  useFrame((state, delta) => {
    if (mode === 'carousel') {
      const aspect = size.width / Math.max(1, size.height);
      const isMobile = aspect < 1.0;
      const baseDist = isMobile ? 11.2 + (1.0 - aspect) * 7.5 : 10.5;

      const isFocused = !!(selectedTapeId || selectedJournalId);
      const mouse = state.pointer;
      const parallaxX = mouse.x * (isMobile ? 0.12 : 0.25);
      const parallaxY = mouse.y * (isMobile ? 0.08 : 0.15);

      if (isFocused) {
        // When focused / playing: centered and framed for phone vs desktop
        const focusY = isMobile ? 0.15 : -0.3;
        targetCamPos.current.set(parallaxX * 0.3, focusY + parallaxY * 0.3, baseDist * (isMobile ? 0.92 : 0.88));
        targetLookAt.current.set(0, focusY, 0);
      } else {
        // Shelf overview: on phone, raise camera so cassette is dead-center between header & dock
        const overviewLookY = isMobile ? 0.1 : -0.5;
        const overviewCamY = isMobile ? 0.75 + parallaxY : 0.4 + parallaxY;
        targetCamPos.current.set(parallaxX, overviewCamY, baseDist);
        targetLookAt.current.set(0, overviewLookY, 0);
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.current.x, 5.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.current.y, 5.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.current.z, 5.5, delta);
      camera.lookAt(targetLookAt.current);
    }
  });

  if (mode === 'spatial') {
    return (
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={5}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2 + 0.05}
        minPolarAngle={Math.PI / 6}
        target={[0, -0.5, 0]}
      />
    );
  }

  return null;
};
