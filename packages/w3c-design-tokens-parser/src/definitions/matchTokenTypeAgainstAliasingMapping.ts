import {
  type Json,
  TokenTypeName,
  tokenTypeNamesMapping,
  strokeStyleLineCapValues,
} from 'design-tokens-format-module';
import {
  matchTypeAgainstMapping,
  TokenTypesMapping,
} from '../utils/tokenTypesMapping.js';

/* ------------------------------------------
   Types mapping
--------------------------------------------- */

const numberTokenTypeMapping = {
  _tokenType: tokenTypeNamesMapping.number,
} satisfies TokenTypesMapping;
const colorTokenTypeMapping = {
  _tokenType: tokenTypeNamesMapping.color,
} satisfies TokenTypesMapping;
const dimensionTokenTypeMapping = {
  _tokenType: tokenTypeNamesMapping.dimension,
} satisfies TokenTypesMapping;
const durationTokenTypeMapping = {
  _tokenType: tokenTypeNamesMapping.duration,
} satisfies TokenTypesMapping;
const fontFamilyTokenTypeMapping = {
  _tokenType: tokenTypeNamesMapping.fontFamily,
} satisfies TokenTypesMapping;
const fontWeightTokenTypeMapping = {
  _tokenType: tokenTypeNamesMapping.fontWeight,
} satisfies TokenTypesMapping;
const cubicBezierTokenTypeMapping = {
  _tokenType: tokenTypeNamesMapping.cubicBezier,
} satisfies TokenTypesMapping;
const strokeStyleTokenTypeMapping = {
  _unionOf: [
    {
      _tokenType: tokenTypeNamesMapping.strokeStyle,
    },
    {
      _mapOf: {
        dashArray: {
          _arrayOf: dimensionTokenTypeMapping,
        },
        lineCap: {
          _unionOf: strokeStyleLineCapValues.map((v) => ({
            _constant: v,
          })),
        },
      },
    },
  ],
} satisfies TokenTypesMapping;
const borderTokenTypeMapping = {
  _unionOf: [
    { _tokenType: tokenTypeNamesMapping.border },
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
    { _tokenType: tokenTypeNamesMapping.transition },
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
    { _tokenType: tokenTypeNamesMapping.shadow },
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
    { _tokenType: tokenTypeNamesMapping.gradient },
    {
      _arrayOf: {
        _mapOf: {
          color: colorTokenTypeMapping,
          position: numberTokenTypeMapping,
        },
      },
    },
  ],
} satisfies TokenTypesMapping;
const typographyTokenTypeMapping = {
  _unionOf: [
    { _tokenType: tokenTypeNamesMapping.typography },
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
export const tokenTypesAliasingMapping: Record<
  TokenTypeName,
  TokenTypesMapping
> = {
  number: numberTokenTypeMapping,
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

export function matchTokenTypeAgainstAliasingMapping(
  type: TokenTypeName,
  input: unknown,
  treePath: Json.ValuePath,
  valuePath: Json.ValuePath,
) {
  return matchTypeAgainstMapping(
    input,
    tokenTypesAliasingMapping[type],
    treePath,
    valuePath,
  );
}
