import * as changeCase from 'change-case';
import { Json } from 'design-tokens-format-module';

export type Case =
  | 'camelCase'
  | 'capitalCase'
  | 'constantCase'
  | 'dotCase'
  | 'kebabCase'
  | 'noCase'
  | 'pascalCase'
  | 'pascalSnakeCase'
  | 'pathCase'
  | 'sentenceCase'
  | 'snakeCase'
  | 'trainCase';

export function stringToCase(
  input: string | number,
  targetCase: Case | undefined,
): string {
  const castedInput = typeof input === 'number' ? input.toString() : input;
  if (targetCase === undefined) {
    return castedInput;
  }
  switch (targetCase) {
    case 'camelCase':
      return changeCase.camelCase(castedInput);
    case 'capitalCase':
      return changeCase.capitalCase(castedInput);
    case 'constantCase':
      return changeCase.constantCase(castedInput);
    case 'dotCase':
      return changeCase.dotCase(castedInput);
    case 'kebabCase':
      return changeCase.kebabCase(castedInput);
    case 'noCase':
      return changeCase.noCase(castedInput);
    case 'pascalCase':
      return changeCase.pascalCase(castedInput);
    case 'pascalSnakeCase':
      return changeCase.pascalCase(castedInput);
    case 'pathCase':
      return changeCase.pathCase(castedInput);
    case 'sentenceCase':
      return changeCase.sentenceCase(castedInput);
    case 'snakeCase':
      return changeCase.snakeCase(castedInput);
    case 'trainCase':
      return changeCase.trainCase(castedInput);
    default: {
      throw new Error(`Unknown case: ${targetCase}`);
    }
  }
}

export function pathToCase(
  path: Json.ValuePath,
  targetCase: Case | undefined,
): string[] {
  if (targetCase === undefined) {
    return path.map((part) =>
      typeof part === 'number' ? part.toString() : part,
    );
  }
  return path.map((part) => stringToCase(part, targetCase));
}
