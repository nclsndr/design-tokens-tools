import { Result } from '@swan-io/boxed';
import { Shadow } from 'design-tokens-format-module';

import { parseAliasableColorValue } from './color.js';
import { parseAliasableDimensionValue } from './dimension.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { makeParseObject } from '../../parser/utils/parseObject.js';
import { withAlias } from '../withAlias.js';

const parseShadowSingleRawValue = makeParseObject({
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
    if (Array.isArray(value)) {
      return Result.all(
        value.map((v, i) =>
          parseShadowSingleRawValue(v, {
            ...ctx,
            varName: `${ctx.varName}[${i}]`,
            valuePath: ctx.valuePath?.concat(i),
          }),
        ),
      ).flatMap((all) => {
        return Result.Ok({
          raw: all.map((v) => ({
            color: v.color.raw,
            offsetX: v.offsetX.raw,
            offsetY: v.offsetY.raw,
            blur: v.blur.raw,
            spread: v.spread.raw,
          })),
          toReferences: all.flatMap((v) => [
            ...v.color.toReferences,
            ...v.offsetX.toReferences,
            ...v.offsetY.toReferences,
            ...v.blur.toReferences,
            ...v.spread.toReferences,
          ]),
        });
      });
    }
    return parseShadowSingleRawValue(value, ctx).flatMap((analyzed) => {
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
    });
  },
);
