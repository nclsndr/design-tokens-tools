import { ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';

import { parseFigmaVariableName } from '@plugin/internals/parseFigmaVariableName';

export function makeDesignTokenAliasValue(variableName: string): string {
  return `{${parseFigmaVariableName(variableName).join(ALIAS_PATH_SEPARATOR)}}`;
}
