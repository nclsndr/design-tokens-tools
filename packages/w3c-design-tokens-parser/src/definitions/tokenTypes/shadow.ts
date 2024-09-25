import { Either } from 'effect';
import { Shadow } from 'design-tokens-format-module';

import { parseAliasableColorValue } from './color.js';
import { parseAliasableDimensionValue } from './dimension.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { makeParseObject } from '../../parser/utils/parseObject.js';
import { withAlias } from '../withAlias.js';
import { mergeEitherItems } from '../../parser/utils/mergeEithers.js';

const parseShadowSingleRawValue = makeParseObject({
  color: { parser: parseAliasableColorValue },
  offsetX: { parser: parseAliasableDimensionValue },
  offsetY: { parser: parseAliasableDimensionValue },
  blur: { parser: parseAliasableDimensionValue },
  spread: { parser: parseAliasableDimensionValue },
  inset: {
    isOptional: true,
    parser: (value: unknown, ctx: AnalyzerContext) => {
      if (value !== undefined && typeof value !== 'boolean') {
        return Either.left([
          new ValidationError({
            type: 'Type',
            nodeId: ctx.nodeId,
            treePath: ctx.path,
            nodeKey: ctx.nodeKey,
            valuePath: ctx.valuePath,
            message: `${ctx.varName} must be a boolean (optional). Got "${typeof value}".`,
          }),
        ]);
      }
      return Either.right({
        raw: value,
        toReferences: [],
      });
    },
  },
});

type ShadowArrayValue = Extract<Shadow.RawValue, Array<any>>;

export const parseAliasableShadowValue = withAlias(
  (
    value: unknown,
    ctx: AnalyzerContext,
  ): Either.Either<AnalyzedValue<Shadow.RawValue>, Array<ValidationError>> => {
    if (Array.isArray(value)) {
      return mergeEitherItems(
        value.map((v, i) =>
          parseShadowSingleRawValue(v, {
            ...ctx,
            varName: `${ctx.varName}[${i}]`,
            valuePath: ctx.valuePath?.concat(i),
          }),
        ),
        {
          raw: [],
          toReferences: [],
        } as AnalyzedValue<ShadowArrayValue>,
        (a, c) => {
          a.raw.push({
            color: c.color.raw,
            offsetX: c.offsetX.raw,
            offsetY: c.offsetY.raw,
            blur: c.blur.raw,
            spread: c.spread.raw,
            ...(c.inset.raw !== undefined ? { inset: c.inset.raw } : {}),
          });
          a.toReferences.push(
            ...c.color.toReferences,
            ...c.offsetX.toReferences,
            ...c.offsetY.toReferences,
            ...c.blur.toReferences,
            ...c.spread.toReferences,
          );
        },
      );
    }
    return parseShadowSingleRawValue(value, ctx).pipe(
      Either.flatMap((analyzed) => {
        return Either.right({
          raw: {
            color: analyzed.color.raw,
            offsetX: analyzed.offsetX.raw,
            offsetY: analyzed.offsetY.raw,
            blur: analyzed.blur.raw,
            spread: analyzed.spread.raw,
            ...(analyzed.inset.raw !== undefined
              ? { inset: analyzed.inset.raw }
              : {}),
          },
          toReferences: [
            ...analyzed.color.toReferences,
            ...analyzed.offsetX.toReferences,
            ...analyzed.offsetY.toReferences,
            ...analyzed.blur.toReferences,
            ...analyzed.spread.toReferences,
          ],
        });
      }),
    );
  },
);
