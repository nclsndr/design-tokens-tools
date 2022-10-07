import { Result } from '@swan-io/boxed';

import { ValidationError } from '../utils/validationError.js';
import { AnalyzerContext } from '../parser/internals/AnalyzerContext.js';
import { AnalyzedValue } from '../parser/internals/AnalyzedToken.js';

import { NumberToken, parseAliasableNumberValue } from './tokenTypes/number.js';
import { parseAliasableStringValue, StringToken } from './tokenTypes/string.js';
import { ColorToken, parseAliasableColorValue } from './tokenTypes/color.js';
import {
  DimensionToken,
  parseAliasableDimensionValue,
} from './tokenTypes/dimension.js';
import {
  DurationToken,
  parseAliasableDurationValue,
} from './tokenTypes/duration.js';
import {
  FontFamilyToken,
  parseAliasableFontFamilyValue,
} from './tokenTypes/fontFamily.js';
import {
  FontWeightToken,
  parseAliasableFontWeightValue,
} from './tokenTypes/fontWeight.js';
import {
  CubicBezierToken,
  parseAliasableCubicBezierValue,
} from './tokenTypes/cubicBezier.js';
import {
  parseAliasableStrokeStyleValue,
  StrokeStyleToken,
} from './tokenTypes/strokeStyle.js';
import { BorderToken, parseAliasableBorderValue } from './tokenTypes/border.js';
import {
  parseAliasableTransitionValue,
  TransitionToken,
} from './tokenTypes/transition.js';
import { parseAliasableShadowValue, ShadowToken } from './tokenTypes/shadow.js';
import {
  GradientToken,
  parseAliasableGradientValue,
} from './tokenTypes/gradient.js';
import {
  parseAliasableTypographyValue,
  TypographyToken,
} from './tokenTypes/typography.js';
import { GroupProperties } from './GroupSignature.js';
import {
  matchTypeAgainstMapping,
  TokenTypesMapping,
} from './tokenTypesMapping.js';
import { JSONValuePath } from './JSONDefinitions.js';

export const numberTokenTypeName = 'number';
export type NumberTokenType = typeof numberTokenTypeName;

export const stringTokenTypeName = 'string';
export type StringTokenType = typeof stringTokenTypeName;

export const colorTokenTypeName = 'color';
export type ColorTokenType = typeof colorTokenTypeName;

export const dimensionTokenTypeName = 'dimension';
export type DimensionTokenType = typeof dimensionTokenTypeName;

export const durationTokenTypeName = 'duration';
export type DurationTokenType = typeof durationTokenTypeName;

export const fontFamilyTokenTypeName = 'fontFamily';
export type FontFamilyTokenType = typeof fontFamilyTokenTypeName;

export const fontWeightTokenTypeName = 'fontWeight';
export type FontWeightTokenType = typeof fontWeightTokenTypeName;

export const cubicBezierTokenTypeName = 'cubicBezier';
export type CubicBezierTokenType = typeof cubicBezierTokenTypeName;

export const borderTokenTypeName = 'border';
export type BorderTokenType = typeof borderTokenTypeName;

export const strokeStyleTokenTypeName = 'strokeStyle';
export type StrokeStyleTokenType = typeof strokeStyleTokenTypeName;

export const transitionTokenTypeName = 'transition';
export type TransitionTokenType = typeof transitionTokenTypeName;

export const shadowTokenTypeName = 'shadow';
export type ShadowTokenType = typeof shadowTokenTypeName;

export const gradientTokenTypeName = 'gradient';
export type GradientTokenType = typeof gradientTokenTypeName;

export const typographyTokenTypeName = 'typography';
export type TypographyTokenType = typeof typographyTokenTypeName;

/* ------------------------------------------
   Types mapping
--------------------------------------------- */
const numberTokenTypeMapping = {
  _tokenType: numberTokenTypeName,
} satisfies TokenTypesMapping;
const stringTokenTypeMapping = {
  _tokenType: stringTokenTypeName,
} satisfies TokenTypesMapping;
const colorTokenTypeMapping = {
  _tokenType: colorTokenTypeName,
} satisfies TokenTypesMapping;
const dimensionTokenTypeMapping = {
  _tokenType: dimensionTokenTypeName,
} satisfies TokenTypesMapping;
const durationTokenTypeMapping = {
  _tokenType: durationTokenTypeName,
} satisfies TokenTypesMapping;
const fontFamilyTokenTypeMapping = {
  _unionOf: [{ _tokenType: fontFamilyTokenTypeName }, stringTokenTypeMapping],
} satisfies TokenTypesMapping;
const fontWeightTokenTypeMapping = {
  _tokenType: fontWeightTokenTypeName,
} satisfies TokenTypesMapping;
const cubicBezierTokenTypeMapping = {
  _tokenType: cubicBezierTokenTypeName,
} satisfies TokenTypesMapping;
const strokeStyleTokenTypeMapping = {
  _tokenType: strokeStyleTokenTypeName,
} satisfies TokenTypesMapping;
const borderTokenTypeMapping = {
  _unionOf: [
    { _tokenType: borderTokenTypeName },
    {
      _mapOf: {
        color: colorTokenTypeMapping,
        style: strokeStyleTokenTypeMapping,
        width: dimensionTokenTypeMapping,
      },
    },
  ],
} satisfies TokenTypesMapping;
const transitionTokenTypeMapping = {
  _unionOf: [
    { _tokenType: transitionTokenTypeName },
    {
      _mapOf: {
        duration: durationTokenTypeMapping,
        delay: durationTokenTypeMapping,
        timingFunction: cubicBezierTokenTypeMapping,
      },
    },
  ],
} satisfies TokenTypesMapping;
const shadowTokenTypeMapping = {
  _unionOf: [
    { _tokenType: shadowTokenTypeName },
    {
      _mapOf: {
        color: colorTokenTypeMapping,
        offsetX: dimensionTokenTypeMapping,
        offsetY: dimensionTokenTypeMapping,
        blur: dimensionTokenTypeMapping,
        spread: dimensionTokenTypeMapping,
      },
    },
  ],
} satisfies TokenTypesMapping;
const gradientTokenTypeMapping = {
  _unionOf: [
    { _tokenType: gradientTokenTypeName },
    {
      _arrayOf: {
        _mapOf: {
          color: colorTokenTypeMapping,
          position: { _primitive: 'number' },
        },
      },
    },
  ],
} satisfies TokenTypesMapping;
const typographyTokenTypeMapping = {
  _unionOf: [
    { _tokenType: typographyTokenTypeName },
    {
      _mapOf: {
        fontFamily: fontFamilyTokenTypeMapping,
        fontWeight: fontWeightTokenTypeMapping,
        fontSize: dimensionTokenTypeMapping,
        letterSpacing: dimensionTokenTypeMapping,
        lineHeight: numberTokenTypeMapping,
      },
    },
  ],
} satisfies TokenTypesMapping;

export const tokenTypesMapping: Record<TokenTypeName, TokenTypesMapping> = {
  number: numberTokenTypeMapping,
  string: stringTokenTypeMapping,
  color: colorTokenTypeMapping,
  dimension: dimensionTokenTypeMapping,
  duration: durationTokenTypeMapping,
  fontFamily: fontFamilyTokenTypeMapping,
  fontWeight: fontWeightTokenTypeMapping,
  cubicBezier: cubicBezierTokenTypeMapping,
  border: borderTokenTypeMapping,
  strokeStyle: strokeStyleTokenTypeMapping,
  transition: transitionTokenTypeMapping,
  shadow: shadowTokenTypeMapping,
  gradient: gradientTokenTypeMapping,
  typography: typographyTokenTypeMapping,
};

export function matchTokenTypeAgainstMapping(
  type: TokenTypeName,
  input: unknown,
  treePath: JSONValuePath,
  valuePath: JSONValuePath,
) {
  return matchTypeAgainstMapping(
    input,
    tokenTypesMapping[type],
    treePath,
    valuePath,
  );
}

/* ------------------------------------------
   Gathering
--------------------------------------------- */
export const tokenTypeNames = [
  numberTokenTypeName,
  stringTokenTypeName,
  colorTokenTypeName,
  dimensionTokenTypeName,
  durationTokenTypeName,
  fontFamilyTokenTypeName,
  fontWeightTokenTypeName,
  cubicBezierTokenTypeName,
  borderTokenTypeName,
  strokeStyleTokenTypeName,
  transitionTokenTypeName,
  shadowTokenTypeName,
  gradientTokenTypeName,
  typographyTokenTypeName,
] as const;

export type TokenType =
  | NumberToken
  | StringToken
  | ColorToken
  | DimensionToken
  | DurationToken
  | FontFamilyToken
  | FontWeightToken
  | CubicBezierToken
  | BorderToken
  | StrokeStyleToken
  | TransitionToken
  | ShadowToken
  | GradientToken
  | TypographyToken;

export type DesignTokenTree = {
  [key: string]: TokenType | DesignTokenTree | GroupProperties;
} & GroupProperties;

export type TokenTypeName =
  | NumberTokenType
  | StringTokenType
  | ColorTokenType
  | DimensionTokenType
  | DurationTokenType
  | FontFamilyTokenType
  | FontWeightTokenType
  | CubicBezierTokenType
  | BorderTokenType
  | StrokeStyleTokenType
  | TransitionTokenType
  | ShadowTokenType
  | GradientTokenType
  | TypographyTokenType;

export function getTokenValueParser(
  type: string,
): (
  value: unknown,
  ctx: AnalyzerContext,
) => Result<AnalyzedValue, Array<ValidationError>> {
  switch (type) {
    case numberTokenTypeName:
      return parseAliasableNumberValue;
    case stringTokenTypeName:
      return parseAliasableStringValue;
    case colorTokenTypeName:
      return parseAliasableColorValue;
    case dimensionTokenTypeName:
      return parseAliasableDimensionValue;
    case durationTokenTypeName:
      return parseAliasableDurationValue;
    case fontFamilyTokenTypeName:
      return parseAliasableFontFamilyValue;
    case fontWeightTokenTypeName:
      return parseAliasableFontWeightValue;
    case cubicBezierTokenTypeName:
      return parseAliasableCubicBezierValue;
    case strokeStyleTokenTypeName:
      return parseAliasableStrokeStyleValue;
    case borderTokenTypeName:
      return parseAliasableBorderValue;
    case transitionTokenTypeName:
      return parseAliasableTransitionValue;
    case shadowTokenTypeName:
      return parseAliasableShadowValue;
    case gradientTokenTypeName:
      return parseAliasableGradientValue;
    case typographyTokenTypeName:
      return parseAliasableTypographyValue;
    default: {
      return (_, ctx) =>
        Result.Error([
          new ValidationError({
            type: 'Value',
            treePath: ctx.path,
            valuePath: ctx.valuePath,
            message: `Unknown $type value: "${type}".`,
          }),
        ]);
    }
  }
}
