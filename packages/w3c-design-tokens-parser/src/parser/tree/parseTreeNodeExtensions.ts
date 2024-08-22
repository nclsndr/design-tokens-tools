import { Result } from '@swan-io/boxed';
import { type JSON } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzerContext } from '../internals/AnalyzerContext.js';

export function parseTreeNodeExtensions(
  value: unknown,
  ctx: AnalyzerContext,
): Result<JSON.Object | undefined, ValidationError[]> {
  if (value === undefined) return Result.Ok(undefined);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        message: `${ctx.varName} must be an object. Got "${typeof value}".`,
      }),
    ]);
  }
  return Result.Ok(value as JSON.Object);
}
