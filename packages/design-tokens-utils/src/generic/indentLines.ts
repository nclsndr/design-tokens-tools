export function indentLines(indent: number, input: string) {
  return input
    .split('\n')
    .map((line) => ' '.repeat(indent) + line)
    .join('\n');
}
