import { WithAliasValueSignature } from '../AliasSignature.js';
import { TokenSignature } from '../TokenSignature.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { Result } from '@swan-io/boxed';

import { withAlias } from '../withAlias.js';

export type CubicBezierRawValue = [number, number, number, number];
export type CubicBezierValue = WithAliasValueSignature<CubicBezierRawValue>;

export type CubicBezierToken = TokenSignature<'cubicBezier', CubicBezierValue>;

export function parseCubicBezierRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<CubicBezierValue>, ValidationError[]> {
  if (!Array.isArray(value) || value.length !== 4) {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be an array of 4 numbers. Got "${typeof value}".`,
      }),
    ]);
  }

  const errors: Array<ValidationError> = [];
  for (let i = 0; i < 4; i++) {
    if (typeof value[i] !== 'number') {
      errors.push(
        new ValidationError({
          type: 'Type',
          treePath: ctx.path,
          nodeKey: ctx.nodeKey,
          valuePath: ctx.valuePath,
          message: `${ctx.varName}[${i}] must be a number. Got "${typeof value[i]}".`,
        }),
      );
      continue;
    }

    if ((i === 0 || i === 2) && (value[i] < 0 || value[i] > 1)) {
      errors.push(
        new ValidationError({
          type: 'Value',
          treePath: ctx.path,
          nodeKey: ctx.nodeKey,
          valuePath: ctx.valuePath,
          message: `${ctx.varName}[${i}] must be a number between 0 and 1. Got "${value[i]}".`,
        }),
      );
    }
  }

  if (errors.length > 0) {
    return Result.Error(errors);
  }
  return Result.Ok({
    raw: value as CubicBezierRawValue,
    toReferences: [],
  });
}

export const parseAliasableCubicBezierValue = withAlias(
  parseCubicBezierRawValue,
);
