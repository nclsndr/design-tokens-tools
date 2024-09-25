import { Effect, Either } from 'effect';
import {
  TokenTypeName,
  tokenTypeNamesMapping,
} from 'design-tokens-format-module';

import { ValidationError } from '../utils/validationError.js';
import { AnalyzerContext } from '../parser/utils/AnalyzerContext.js';
import { AnalyzedValue } from '../parser/token/AnalyzedToken.js';

import { parseAliasableNumberValue } from './tokenTypes/number.js';
import { parseAliasableBorderValue } from './tokenTypes/border.js';
import { parseAliasableColorValue } from './tokenTypes/color.js';
import { parseAliasableDimensionValue } from './tokenTypes/dimension.js';
import { parseAliasableDurationValue } from './tokenTypes/duration.js';
import { parseAliasableFontFamilyValue } from './tokenTypes/fontFamily.js';
import { parseAliasableFontWeightValue } from './tokenTypes/fontWeight.js';
import { parseAliasableCubicBezierValue } from './tokenTypes/cubicBezier.js';
import { parseAliasableStrokeStyleValue } from './tokenTypes/strokeStyle.js';
import { parseAliasableTransitionValue } from './tokenTypes/transition.js';
import { parseAliasableShadowValue } from './tokenTypes/shadow.js';
import { parseAliasableGradientValue } from './tokenTypes/gradient.js';
import { parseAliasableTypographyValue } from './tokenTypes/typography.js';

/* ------------------------------------------
   Parsers
--------------------------------------------- */
export function getTokenValueParser(
  type: string,
): (
  value: unknown,
  ctx: AnalyzerContext,
) => Either.Either<AnalyzedValue, Array<ValidationError>> {
  switch (type) {
    case tokenTypeNamesMapping.number:
      return parseAliasableNumberValue;
    case tokenTypeNamesMapping.color:
      return parseAliasableColorValue;
    case tokenTypeNamesMapping.dimension:
      return parseAliasableDimensionValue;
    case tokenTypeNamesMapping.duration:
      return parseAliasableDurationValue;
    case tokenTypeNamesMapping.fontFamily:
      return parseAliasableFontFamilyValue;
    case tokenTypeNamesMapping.fontWeight:
      return parseAliasableFontWeightValue;
    case tokenTypeNamesMapping.cubicBezier:
      return parseAliasableCubicBezierValue;
    case tokenTypeNamesMapping.strokeStyle:
      return parseAliasableStrokeStyleValue;
    case tokenTypeNamesMapping.border:
      return parseAliasableBorderValue;
    case tokenTypeNamesMapping.transition:
      return parseAliasableTransitionValue;
    case tokenTypeNamesMapping.shadow:
      return parseAliasableShadowValue;
    case tokenTypeNamesMapping.gradient:
      return parseAliasableGradientValue;
    case tokenTypeNamesMapping.typography:
      return parseAliasableTypographyValue;
    default: {
      return (_, ctx) =>
        Either.left([
          new ValidationError({
            type: 'Value',
            nodeId: ctx.nodeId,
            treePath: ctx.path,
            valuePath: ctx.valuePath,
            message: `Unknown $type value: "${type}".`,
          }),
        ]);
    }
  }
}
