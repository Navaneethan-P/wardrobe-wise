// Extract dominant color from an image using canvas sampling
export function extractDominantColor(imageDataUrl: string): Promise<{ hex: string; name: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      resolve({ hex, name: getColorName(r, g, b) });
    };
    img.onerror = () => resolve({ hex: '#888888', name: 'Gray' });
    img.src = imageDataUrl;
  });
}

function getColorName(r: number, g: number, b: number): string {
  const colors: [string, number, number, number][] = [
    ['Black', 0, 0, 0], ['White', 255, 255, 255], ['Red', 200, 30, 30],
    ['Blue', 30, 30, 200], ['Navy', 0, 0, 128], ['Green', 30, 150, 30],
    ['Yellow', 230, 230, 30], ['Orange', 230, 130, 30], ['Pink', 230, 100, 150],
    ['Purple', 130, 30, 180], ['Brown', 139, 90, 43], ['Gray', 128, 128, 128],
    ['Beige', 220, 200, 170], ['Teal', 0, 128, 128], ['Maroon', 128, 0, 0],
    ['Olive', 128, 128, 0], ['Cream', 255, 253, 208],
  ];
  let closest = 'Gray';
  let minDist = Infinity;
  for (const [name, cr, cg, cb] of colors) {
    const d = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
    if (d < minDist) { minDist = d; closest = name; }
  }
  return closest;
}

// Color compatibility scoring
export function colorCompatibility(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 50;

  const hsl1 = rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
  const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

  // Neutrals match everything well
  if (hsl1.s < 10 || hsl2.s < 10) return 85;
  // Both neutrals
  if (hsl1.s < 10 && hsl2.s < 10) return 90;

  const hueDiff = Math.abs(hsl1.h - hsl2.h);
  const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);

  // Complementary (opposite on wheel) — great
  if (normalizedDiff > 150 && normalizedDiff < 210) return 88;
  // Analogous (nearby) — great
  if (normalizedDiff < 30) return 82;
  // Triadic
  if (normalizedDiff > 110 && normalizedDiff < 130) return 78;
  // Split complementary
  if (normalizedDiff > 130 && normalizedDiff < 160) return 75;
  // Moderate contrast
  if (normalizedDiff > 60 && normalizedDiff < 110) return 60;

  return 55;
}

export function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function colorDistance(hex1: string, hex2: string): number {
  const a = hexToRgb(hex1), b = hexToRgb(hex2);
  if (!a || !b) return 999;
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}
