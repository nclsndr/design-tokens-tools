import { AnalyzerContext } from '../internals/AnalyzerContext.js';
import { Result } from '@swan-io/boxed';
import { JSONObject } from '../../definitions/JSONDefinitions.js';
import { ValidationError } from '../../utils/validationError.js';

export function parseTreeNode(
  value: unknown,
  ctx: AnalyzerContext,
): Result<JSONObject, ValidationError[]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be an object. Got "${Array.isArray(value) ? 'array' : typeof value}".`,
      }),
    ]);
  }
  return Result.Ok(value as JSONObject);
}
