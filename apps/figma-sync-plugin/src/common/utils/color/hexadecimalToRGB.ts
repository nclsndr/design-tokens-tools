export function hexadecimalToRGB(hexadecimal: string): {
  r: number;
  g: number;
  b: number;
} {
  const hex = hexadecimal.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return { r, g, b };
}
