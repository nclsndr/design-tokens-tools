import { Result } from '@swan-io/boxed';

import { parseAliasableColorValue } from './color.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { ValidationError } from '../../utils/validationError.js';
import { makeParseObject } from '../../parser/internals/parseObject.js';
import { parseAliasableNumberValue } from './number.js';
import { clamp } from '../../utils/clamp.js';
import { withAlias } from '../withAlias.js';
import { Gradient } from 'design-tokens-format-module';

const parseSingleGradientRawValue = makeParseObject({
  color: {
    parser: parseAliasableColorValue,
  },
  position: {
    parser: (value, ctx) =>
      parseAliasableNumberValue(value, ctx).map((analyzed) => ({
        ...analyzed,
        raw:
          typeof analyzed.raw === 'number'
            ? clamp(analyzed.raw, 0, 1)
            : analyzed.raw,
      })),
  },
});

function parseGradientRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<Gradient.RawValue>, Array<ValidationError>> {
  if (!Array.isArray(value)) {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `Gradient must be an array. Got "${typeof value}".`,
      }),
    ]);
  }

  const errors: Array<ValidationError> = [];
  const final: AnalyzedValue<Gradient.RawValue> = { raw: [], toReferences: [] };

  for (const [i, s] of value.entries()) {
    parseSingleGradientRawValue(s, {
      ...ctx,
      varName: `${ctx.varName}[${i}]`,
      valuePath: (ctx.valuePath ?? []).concat([i]),
    })
      .tapOk((analyzed) => {
        final.raw.push({
          color: analyzed.color.raw,
          position: analyzed.position.raw,
        });
        final.toReferences.push(...analyzed.color.toReferences);
        final.toReferences.push(...analyzed.position.toReferences);
      })
      .tapError((err) => {
        errors.push(...err);
      });
  }

  if (errors.length > 0) {
    return Result.Error(errors);
  }
  return Result.Ok(final);
}

export const parseAliasableGradientValue = withAlias(parseGradientRawValue);