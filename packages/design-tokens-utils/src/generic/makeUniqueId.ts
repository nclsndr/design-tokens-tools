const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function makeUniqueId(length = 8) {
  const randPart = Math.ceil(length * 0.3);
  const datePart = Math.floor(length * 0.7);

  let result = '';
  for (let i = 0; i < randPart; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result + Date.now().toString(16).slice(-datePart);
}
