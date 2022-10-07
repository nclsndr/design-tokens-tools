import { WithAliasValueSignature } from '../AliasSignature.js';
import { ColorValue, parseAliasableColorValue } from './color.js';
import { DimensionValue, parseAliasableDimensionValue } from './dimension.js';
import { TokenSignature } from '../TokenSignature.js';
import { ValidationError } from '../../utils/validationError.js';
import { Result } from '@swan-io/boxed';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { makeParseObject } from '../../parser/internals/parseObject.js';

import { withAlias } from '../withAlias.js';

export type ShadowValue = WithAliasValueSignature<{
  color: ColorValue;
  offsetX: DimensionValue;
  offsetY: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
}>;

export type ShadowToken = TokenSignature<'shadow', ShadowValue>;

const parseShadowRawValue = makeParseObject({
  color: { parser: parseAliasableColorValue },
  offsetX: { parser: parseAliasableDimensionValue },
  offsetY: { parser: parseAliasableDimensionValue },
  blur: { parser: parseAliasableDimensionValue },
  spread: { parser: parseAliasableDimensionValue },
});

export const parseAliasableShadowValue = withAlias(
  (
    value: unknown,
    ctx: AnalyzerContext,
  ): Result<AnalyzedValue<ShadowValue>, Array<ValidationError>> => {
    return parseShadowRawValue(value, ctx).match({
      Ok: (analyzed) => {
        return Result.Ok({
          raw: {
            color: analyzed.color.raw,
            offsetX: analyzed.offsetX.raw,
            offsetY: analyzed.offsetY.raw,
            blur: analyzed.blur.raw,
            spread: analyzed.spread.raw,
          },
          toReferences: [
            ...analyzed.color.toReferences,
            ...analyzed.offsetX.toReferences,
            ...analyzed.offsetY.toReferences,
            ...analyzed.blur.toReferences,
            ...analyzed.spread.toReferences,
          ],
        });
      },
      Error: (err) => {
        return Result.Error(err);
      },
    });
  },
);
