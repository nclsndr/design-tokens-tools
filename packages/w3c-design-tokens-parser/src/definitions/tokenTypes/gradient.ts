import { Effect, Either } from 'effect';

import { parseAliasableColorValue } from './color.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { ValidationError } from '../../utils/validationError.js';
import { makeParseObject } from '../../parser/utils/parseObject.js';
import { parseAliasableNumberValue } from './number.js';
import { clamp } from '../../utils/clamp.js';
import { withAlias } from '../withAlias.js';
import { Gradient } from 'design-tokens-format-module';

const parseSingleGradientRawValue = makeParseObject({
  position: {
    parser: (value, ctx) =>
      parseAliasableNumberValue(value, ctx).pipe(
        Effect.map((analyzed) => ({
          ...analyzed,
          raw:
            typeof analyzed.raw === 'number'
              ? clamp(analyzed.raw, 0, 1)
              : analyzed.raw,
        })),
      ),
  },
  color: {
    parser: parseAliasableColorValue,
  },
});

function parseGradientRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<AnalyzedValue<Gradient.RawValue>, Array<ValidationError>> {
  if (!Array.isArray(value)) {
    return Effect.fail([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `Gradient must be an array. Got "${typeof value}".`,
      }),
    ]);
  }

  return Effect.all(
    value.map((s, i) =>
      parseSingleGradientRawValue(s, {
        ...ctx,
        varName: `${ctx.varName}[${i}]`,
        valuePath: (ctx.valuePath ?? []).concat([i]),
      }),
    ),
    {
      mode: 'either',
    },
  ).pipe(
    Effect.flatMap((analyzedValueEitherItems) => {
      const [values, errors] = analyzedValueEitherItems.reduce<
        [
          Array<{
            position: { raw: any; toReferences: Array<any> };
            color: { raw: any; toReferences: Array<any> };
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
        : Effect.succeed(
            values.reduce<AnalyzedValue<Gradient.RawValue>>(
              (acc, c) => {
                acc.raw.push({
                  color: c.color.raw,
                  position: c.position.raw,
                });
                acc.toReferences.push(...c.color.toReferences);
                acc.toReferences.push(...c.position.toReferences);
                return acc;
              },
              {
                raw: [],
                toReferences: [],
              },
            ),
          );
    }),
  );
}

export const parseAliasableGradientValue = withAlias(parseGradientRawValue);
