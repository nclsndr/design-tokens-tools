import { Result } from '@swan-io/boxed';

import { WithAliasValueSignature } from '../AliasSignature.js';
import { TokenSignature } from '../TokenSignature.js';
import { ColorValue, parseAliasableColorValue } from './color.js';
import {
  parseAliasableStrokeStyleValue,
  StrokeStyleValue,
} from './strokeStyle.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { ValidationError } from '../../utils/validationError.js';
import { DimensionValue, parseAliasableDimensionValue } from './dimension.js';
import { makeParseObject } from '../../parser/internals/parseObject.js';
import { withAlias } from '../withAlias.js';

export type BorderValue = WithAliasValueSignature<{
  color: ColorValue;
  width: DimensionValue;
  style: StrokeStyleValue;
}>;

export type BorderToken = TokenSignature<'border', BorderValue>;

const parseBorderRawValue = makeParseObject({
  color: { parser: parseAliasableColorValue },
  width: { parser: parseAliasableDimensionValue },
  style: { parser: parseAliasableStrokeStyleValue },
});

export const parseAliasableBorderValue = withAlias(
  (
    value: unknown,
    ctx: AnalyzerContext,
  ): Result<AnalyzedValue<BorderValue>, Array<ValidationError>> => {
    return parseBorderRawValue(value, ctx).match({
      Ok: (analyzed) => {
        return Result.Ok({
          raw: {
            color: analyzed.color.raw,
            width: analyzed.width.raw,
            style: analyzed.style.raw,
          },
          toReferences: [
            ...analyzed.color.toReferences,
            ...analyzed.width.toReferences,
            ...analyzed.style.toReferences,
          ],
        });
      },
      Error: (err) => {
        return Result.Error(err);
      },
    });
  },
);
