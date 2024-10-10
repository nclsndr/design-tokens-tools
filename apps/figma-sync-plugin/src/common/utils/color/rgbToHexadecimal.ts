export function rgbToHexadecimal(r: number, g: number, b: number): string {
  const rChannel = Math.round(r * 255).toString(16);
  const gChannel = Math.round(g * 255).toString(16);
  const bChannel = Math.round(b * 255).toString(16);
  return `#${rChannel.length === 1 ? `0${rChannel}` : rChannel}${
    gChannel.length === 1 ? `0${gChannel}` : gChannel
  }${bChannel.length === 1 ? `0${bChannel}` : bChannel}`;
}
