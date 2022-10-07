import { AnalyzerContext } from '../internals/AnalyzerContext.js';
import { Result } from '@swan-io/boxed';
import { ValidationError } from '../../utils/validationError.js';

export function parseTreeNodeDescription(
  value: unknown,
  ctx: AnalyzerContext,
): Result<string | undefined, ValidationError[]> {
  if (value === undefined) return Result.Ok(undefined);
  if (typeof value !== 'string') {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        message: `${ctx.varName} must be a string. Got "${typeof value}".`,
      }),
    ]);
  }
  return Result.Ok(value);
}
