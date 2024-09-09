import { Result } from '@swan-io/boxed';
import { AliasValue } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzerContext } from '../utils/AnalyzerContext.js';

export function parseAliasValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AliasValue, ValidationError[]> {
  if (typeof value !== 'string') {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
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
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be wrapped in curly braces to form an alias reference, like: "{my.alias}". Got "${value}".`,
      }),
    ]);
  }
  return Result.Ok(value as AliasValue);
}
