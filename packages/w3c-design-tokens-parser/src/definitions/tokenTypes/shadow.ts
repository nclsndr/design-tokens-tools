import { Effect, Either } from 'effect';
import { Color, Dimension, Shadow } from 'design-tokens-format-module';

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
  ): Effect.Effect<AnalyzedValue<Shadow.RawValue>, Array<ValidationError>> => {
    if (Array.isArray(value)) {
      return Effect.all(
        value.map((v, i) =>
          parseShadowSingleRawValue(v, {
            ...ctx,
            varName: `${ctx.varName}[${i}]`,
            valuePath: ctx.valuePath?.concat(i),
          }),
        ),
        {
          mode: 'either',
        },
      ).pipe(
        Effect.flatMap((all) => {
          const [raws, errors] = all.reduce<
            [
              Array<{
                color: AnalyzedValue<Color.Value>;
                offsetX: AnalyzedValue<Dimension.Value>;
                offsetY: AnalyzedValue<Dimension.Value>;
                blur: AnalyzedValue<Dimension.Value>;
                spread: AnalyzedValue<Dimension.Value>;
              }>,
              Array<ValidationError>,
            ]
          >(
            (acc, c) => {
              if (Either.isLeft(c)) {
                acc[1].push(...c.left);
              } else if (Either.isRight(c)) {
                acc[0].push(c.right);
              }
              return acc;
            },
            [[], []],
          );

          return errors.length > 0
            ? Effect.fail(errors)
            : Effect.succeed({
                raw: raws.map((v) => ({
                  color: v.color.raw,
                  offsetX: v.offsetX.raw,
                  offsetY: v.offsetY.raw,
                  blur: v.blur.raw,
                  spread: v.spread.raw,
                })),
                toReferences: raws.flatMap((v) => [
                  ...v.color.toReferences,
                  ...v.offsetX.toReferences,
                  ...v.offsetY.toReferences,
                  ...v.blur.toReferences,
                  ...v.spread.toReferences,
                ]),
              });
        }),
      );
    }
    return parseShadowSingleRawValue(value, ctx).pipe(
      Effect.flatMap((analyzed) => {
        return Effect.succeed({
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
      }),
    );
  },
);
