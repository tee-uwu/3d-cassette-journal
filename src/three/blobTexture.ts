import * as THREE from 'three';

let cachedBlobTexture: THREE.CanvasTexture | null = null;

export function getBlobTexture(): THREE.CanvasTexture {
  if (cachedBlobTexture) return cachedBlobTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
    gradient.addColorStop(0, 'rgba(60,40,20,0.55)');
    gradient.addColorStop(1, 'rgba(60,40,20,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedBlobTexture = texture;
  return texture;
}
