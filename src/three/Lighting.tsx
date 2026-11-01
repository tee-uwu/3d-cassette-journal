import React from 'react';
import { useTapeStore } from '../stores/useTapeStore';

export const Lighting: React.FC = () => {
  const { galleryTheme } = useTapeStore();

  let hemiSky = 0xfff4e0;
  let hemiGround = 0xcdb48e;
  let dirColor = 0xfff0d4;
  let dirIntensity = 0.85;
  let pointColor = 0xffd9a8;
  let pointIntensity = 0.35;

  if (galleryTheme === 'sunset') {
    hemiSky = 0xffd2a0;
    hemiGround = 0x9e5235;
    dirColor = 0xffaa66;
    dirIntensity = 1.1;
    pointColor = 0xff7744;
    pointIntensity = 0.55;
  } else if (galleryTheme === 'obsidian') {
    hemiSky = 0x7a6a99;
    hemiGround = 0x1f1828;
    dirColor = 0xd5c8f8;
    dirIntensity = 0.7;
    pointColor = 0x66c8ff;
    pointIntensity = 0.6;
  } else if (galleryTheme === 'rose') {
    hemiSky = 0xffe4ec;
    hemiGround = 0xcfa3b0;
    dirColor = 0xffd6e2;
    dirIntensity = 0.9;
    pointColor = 0xff99bb;
    pointIntensity = 0.45;
  } else if (galleryTheme === 'crystal') {
    hemiSky = 0xe0f7ff;
    hemiGround = 0x9ec7db;
    dirColor = 0xdaf2fc;
    dirIntensity = 0.95;
    pointColor = 0x73d7ff;
    pointIntensity = 0.5;
  }

  return (
    <>
      {/* Ambient hemisphere light adapted to theme */}
      <hemisphereLight
        args={[hemiSky, hemiGround, 0.95]}
      />

      {/* Main directional light with specular punch */}
      <directionalLight
        position={[3, 5, 7]}
        intensity={dirIntensity}
        color={dirColor}
      />

      {/* Soft warm/tinted fill point light */}
      <pointLight
        position={[-5, 2, 5]}
        intensity={pointIntensity}
        distance={30}
        color={pointColor}
      />
    </>
  );
};
