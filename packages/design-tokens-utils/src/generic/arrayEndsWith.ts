export function arrayEndsWith(
  arr: Array<string | number>,
  end: string | number,
): boolean {
  if (arr.length === 0) return false;
  return arr[arr.length - 1] === end;
}
