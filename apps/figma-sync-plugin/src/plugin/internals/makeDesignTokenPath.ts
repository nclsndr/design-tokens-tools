import { parseFigmaVariableName } from '@plugin/internals/parseFigmaVariableName';
import { DesignToken, TokenTypeName } from 'design-tokens-format-module';

export function makeDesignTokenPath(
  collectionName: string,
  variableName: string
): Array<string> {
  return [collectionName, ...parseFigmaVariableName(variableName)];
}

export function makeDesignToken(params: {
  type: TokenTypeName;
  value: any;
  description?: string;
}): DesignToken {
  const token: DesignToken = {
    $type: params.type,
    $value: params.value,
  };
  if (params.description !== undefined) {
    token['$description'] = params.description;
  }
  return token;
}
