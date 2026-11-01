import * as THREE from 'three';

interface LabelConfig {
  title: string;
  artist?: string;
  date?: string;
  subtitle?: string;
  labelColor?: string;
  artworkUrl?: string;
  labelStyle?: 'standard' | 'photo-full' | 'polaroid' | 'minimal';
}

const textureCache = new Map<string, THREE.CanvasTexture>();

export function createCassetteLabelTexture(config: LabelConfig): THREE.CanvasTexture {
  const cacheKey = `${config.title}_${config.artist || ''}_${config.date || ''}_${config.labelColor || ''}_${config.artworkUrl || ''}_${config.labelStyle || 'standard'}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  // 1024 x 336 (Ultra-sharp rendering)
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 336;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const render = (img?: HTMLImageElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Warm ivory vintage label stock
    ctx.fillStyle = '#f6f0e2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grain fibers
    ctx.fillStyle = 'rgba(60, 45, 30, 0.03)';
    for (let i = 0; i < 400; i += 20) {
      ctx.fillRect(i * 2.5, (i * 3.7) % 336, 1.5, 1.5);
    }

    // Top label color stripe
    ctx.fillStyle = config.labelColor || '#d8a25e';
    ctx.fillRect(0, 0, canvas.width, 76);

    // Dark separator pinstripe
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 74, canvas.width, 2);

    // Classic Cassette "SIDE A" circular badge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(58, 38, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e1a17';
    ctx.font = '900 24px "Inter", "Figtree", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', 58, 46);

    // Center Red Alignment Stripe
    ctx.fillStyle = '#e63946';
    ctx.fillRect(canvas.width / 2 - 2, 0, 4, 76);

    // Technical Tape Type Badges (Swiss style)
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "Inter", "Figtree", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('TYPE II · CHROME 70µs', canvas.width - 32, 33);
    ctx.font = '500 14px "Inter", "Figtree", sans-serif';
    ctx.fillText('DOLBY B-C NR · C-60', canvas.width - 32, 56);

    ctx.textAlign = 'left';

    // If artwork photo is present
    if (img && img.naturalWidth) {
      const artW = 220;
      const artH = 220;
      const artX = canvas.width - artW - 36;
      const artY = 90;

      // Polaroid photo frame
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(60, 40, 20, 0.25)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(artX, artY, artW, artH);
      ctx.shadowColor = 'transparent';

      // Draw photo inside frame
      const photoMargin = 10;
      const pW = artW - photoMargin * 2;
      const pH = artH - photoMargin * 2 - 20;
      const k = Math.max(pW / img.naturalWidth, pH / img.naturalHeight);
      const iw = img.naturalWidth * k;
      const ih = img.naturalHeight * k;

      ctx.save();
      ctx.beginPath();
      ctx.rect(artX + photoMargin, artY + photoMargin, pW, pH);
      ctx.clip();
      ctx.drawImage(img, artX + photoMargin + (pW - iw) / 2, artY + photoMargin + (pH - ih) / 2, iw, ih);
      ctx.restore();

      // Ruled lines for writing on the left
      ctx.strokeStyle = 'rgba(60, 45, 30, 0.22)';
      ctx.lineWidth = 2.5;
      [220, 276].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(48, y);
        ctx.lineTo(artX - 30, y);
        ctx.stroke();
      });

      // Index numbers: 1 and 2
      ctx.fillStyle = 'rgba(60, 45, 30, 0.4)';
      ctx.font = '700 16px "Inter", sans-serif';
      ctx.fillText('1', 32, 180);
      ctx.fillText('2', 32, 312);

      // Handwritten Title (Caveat + Anek Bangla / Noto Sans Bengali)
      const maxTitleW = artX - 70;
      let titleSize = 78;
      ctx.font = `700 ${titleSize}px Caveat, "Anek Bangla", "Noto Sans Bengali", cursive, sans-serif`;
      while (ctx.measureText(config.title).width > maxTitleW && titleSize > 34) {
        titleSize -= 3;
        ctx.font = `700 ${titleSize}px Caveat, "Anek Bangla", "Noto Sans Bengali", cursive, sans-serif`;
      }
      ctx.fillStyle = '#2c221a';
      ctx.fillText(config.title, 48, 184);

      // Date / Artist handwritten subtitle
      const meta = config.date || (config.artist ? `${config.artist} ${config.subtitle ? '· ' + config.subtitle : ''}` : 'MASTER STUDIO RECORDING');
      const maxMetaW = artX - 70;
      let metaSize = 46;
      ctx.font = `600 ${metaSize}px Caveat, "Anek Bangla", "Noto Sans Bengali", cursive, sans-serif`;
      while (ctx.measureText(meta).width > maxMetaW && metaSize > 24) {
        metaSize -= 2;
        ctx.font = `600 ${metaSize}px Caveat, "Anek Bangla", "Noto Sans Bengali", cursive, sans-serif`;
      }
      ctx.fillText(meta, 48, 314);
    } else {
      // Classic notebook ruled lines
      ctx.strokeStyle = 'rgba(60, 45, 30, 0.22)';
      ctx.lineWidth = 2.5;
      [220, 276].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(48, y);
        ctx.lineTo(canvas.width - 48, y);
        ctx.stroke();
      });

      // Index numbers: 1 and 2
      ctx.fillStyle = 'rgba(60, 45, 30, 0.4)';
      ctx.font = '700 16px "Inter", sans-serif';
      ctx.fillText('1', 32, 180);
      ctx.fillText('2', 32, 312);

      // Handwritten Title
      const maxTitleW = canvas.width - 96;
      let titleSize = 82;
      ctx.font = `700 ${titleSize}px Caveat, "Anek Bangla", "Noto Sans Bengali", cursive, sans-serif`;
      while (ctx.measureText(config.title).width > maxTitleW && titleSize > 38) {
        titleSize -= 3;
        ctx.font = `700 ${titleSize}px Caveat, "Anek Bangla", "Noto Sans Bengali", cursive, sans-serif`;
      }
      ctx.fillStyle = '#2c221a';
      ctx.fillText(config.title, 48, 186);

      // Artist & subtitle
      const meta = config.artist ? `${config.artist} ${config.subtitle ? '· ' + config.subtitle : ''}` : (config.date || 'SIDE A · MASTER RECORDING');
      let metaSize = 52;
      ctx.font = `600 ${metaSize}px Caveat, "Anek Bangla", "Noto Sans Bengali", cursive, sans-serif`;
      while (ctx.measureText(meta).width > maxTitleW && metaSize > 26) {
        metaSize -= 2;
        ctx.font = `600 ${metaSize}px Caveat, "Anek Bangla", "Noto Sans Bengali", cursive, sans-serif`;
      }
      ctx.fillText(meta, 48, 316);
    }

    texture.needsUpdate = true;
  };

  if (config.artworkUrl && (config.artworkUrl.startsWith('data:') || config.artworkUrl.startsWith('http') || config.artworkUrl.startsWith('/'))) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => render(img);
    img.onerror = () => render();
    img.src = config.artworkUrl;
  } else {
    render();
  }

  textureCache.set(cacheKey, texture);
  return texture;
}
