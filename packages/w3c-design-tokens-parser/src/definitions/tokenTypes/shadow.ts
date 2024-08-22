import { Result } from '@swan-io/boxed';
import { Shadow } from 'design-tokens-format-module';

import { parseAliasableColorValue } from './color.js';
import { parseAliasableDimensionValue } from './dimension.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { makeParseObject } from '../../parser/internals/parseObject.js';
import { withAlias } from '../withAlias.js';

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
  ): Result<AnalyzedValue<Shadow.RawValue>, Array<ValidationError>> => {
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
