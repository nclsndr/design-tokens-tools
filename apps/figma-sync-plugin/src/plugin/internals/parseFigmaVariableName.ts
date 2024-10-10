export function parseFigmaVariableName(name: string): Array<string> {
  return name.split('/');
}
