import { Either } from 'effect';
import { CubicBezier } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { withAlias } from '../withAlias.js';

export type CubicBezierRawValue = [number, number, number, number];

export function parseCubicBezierRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<AnalyzedValue<CubicBezier.Value>, ValidationError[]> {
  if (!Array.isArray(value) || value.length !== 4) {
    return Either.left([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
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
          nodeId: ctx.nodeId,
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
          nodeId: ctx.nodeId,
          treePath: ctx.path,
          nodeKey: ctx.nodeKey,
          valuePath: ctx.valuePath,
          message: `${ctx.varName}[${i}] must be a number between 0 and 1. Got "${value[i]}".`,
        }),
      );
    }
  }

  if (errors.length > 0) {
    return Either.left(errors);
  }
  return Either.right({
    raw: value as CubicBezierRawValue,
    toReferences: [],
  });
}

export const parseAliasableCubicBezierValue = withAlias(
  parseCubicBezierRawValue,
);
