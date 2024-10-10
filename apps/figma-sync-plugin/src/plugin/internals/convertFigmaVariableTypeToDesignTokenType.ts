import { VariableResolvedDataType } from '@figma/plugin-typings/plugin-api-standalone';
import { TokenTypeName } from 'design-tokens-format-module';
import { Option } from '@swan-io/boxed';

export function convertFigmaVariableTypeToDesignTokenType(
  figmaType: VariableResolvedDataType
): TokenTypeName | undefined {
  switch (figmaType) {
    case 'FLOAT':
      return 'number';
    case 'BOOLEAN':
      return 'number';
    case 'COLOR':
      return 'color';
    default:
      return undefined;
  }
}

export function convertFigmaVariableTypeToDesignTokenTypeOption(
  figmaType: VariableResolvedDataType
): Option<TokenTypeName> {
  const type = convertFigmaVariableTypeToDesignTokenType(figmaType);
  if (type) {
    return Option.Some(type);
  }
  return Option.None();
}
