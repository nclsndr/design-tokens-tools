import { Result } from '@swan-io/boxed';

import { ValidationError } from '../../utils/validationError.js';
import { AliasValueSignature } from '../../definitions/AliasSignature.js';
import { AnalyzerContext } from '../internals/AnalyzerContext.js';

export function parseAliasValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AliasValueSignature, ValidationError[]> {
  if (typeof value !== 'string') {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} alias must be a string. Got "${typeof value}".`,
      }),
    ]);
  }
  if (!value.startsWith('{') || !value.endsWith('}')) {
    return Result.Error([
      new ValidationError({
        type: 'Value',
        treePath: ctx.path,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be wrapped in curly braces to form an alias reference, like: "{my.alias}". Got "${value}".`,
      }),
    ]);
  }
  return Result.Ok(value as AliasValueSignature);
}
