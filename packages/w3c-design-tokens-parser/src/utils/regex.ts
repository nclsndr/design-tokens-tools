export function stringToRegex(input: string): RegExp {
  if (input === '*') {
    return new RegExp('.*');
  }
  return new RegExp(input);
}
