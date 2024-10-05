import { Either } from 'effect';
import { Gradient } from 'design-tokens-format-module';
import { clamp } from '@nclsndr/design-tokens-utils';

import { parseAliasableColorValue } from './color.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { ValidationError } from '@nclsndr/design-tokens-utils';
import { makeParseObject } from '../../parser/utils/parseObject.js';
import { parseAliasableNumberValue } from './number.js';
import { withAlias } from '../internals/withAlias.js';
import { mergeEitherItems } from '../../parser/utils/mergeEithers.js';

const parseSingleGradientRawValue = makeParseObject({
  position: {
    parser: (value, ctx) =>
      parseAliasableNumberValue(value, ctx).pipe(
        Either.map((analyzed) => ({
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
): Either.Either<AnalyzedValue<Gradient.RawValue>, Array<ValidationError>> {
  if (!Array.isArray(value)) {
    return Either.left([
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

  return mergeEitherItems(
    value.map((s, i) =>
      parseSingleGradientRawValue(s, {
        ...ctx,
        varName: `${ctx.varName}[${i}]`,
        valuePath: (ctx.valuePath ?? []).concat([i]),
      }),
    ),
    {
      raw: [],
      toReferences: [],
    } as AnalyzedValue<Gradient.RawValue>,
    (a, c) => {
      a.raw.push({
        color: c.color.raw,
        position: c.position.raw,
      });
      a.toReferences.push(...c.color.toReferences);
      a.toReferences.push(...c.position.toReferences);
    },
  );
}

export const parseAliasableGradientValue = withAlias(parseGradientRawValue);
