interface RGB { r: number; g: number; b: number; }
interface LAB { l: number; a: number; b: number; }
interface LCH { l: number; c: number; h: number; }

export const rgbToLab = (rgb: RGB): LAB => {
  // Convert RGB to XYZ
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;

  // Convert XYZ to Lab
  const xn = 95.047;
  const yn = 100.000;
  const zn = 108.883;

  const fx = x / xn > 0.008856 ? Math.pow(x / xn, 1/3) : (7.787 * x / xn) + 16/116;
  const fy = y / yn > 0.008856 ? Math.pow(y / yn, 1/3) : (7.787 * y / yn) + 16/116;
  const fz = z / zn > 0.008856 ? Math.pow(z / zn, 1/3) : (7.787 * z / zn) + 16/116;

  return {
    l: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
};

export const labToLch = (lab: LAB): LCH => {
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { l: lab.l, c, h };
};

export const lchToLab = (lch: LCH): LAB => {
  const hr = lch.h * (Math.PI / 180);
  return {
    l: lch.l,
    a: lch.c * Math.cos(hr),
    b: lch.c * Math.sin(hr)
  };
};

export const labToRgb = (lab: LAB): RGB => {
  let y = (lab.l + 16) / 116;
  let x = lab.a / 500 + y;
  let z = y - lab.b / 200;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  let r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  let b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;

  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(b * 255)))
  };
};

export const getChromaCurve = (index: number, total: number, maxChroma: number): number => {
  const x = index / (total - 1);
  const peak = 0.7; // Peak at 70%
  const curve = 1 - Math.pow(2 * (x - peak), 2);
  return Math.max(0, Math.min(maxChroma, maxChroma * curve));
};