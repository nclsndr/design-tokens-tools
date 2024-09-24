import { Effect } from 'effect';
import { AliasValue } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzerContext } from '../utils/AnalyzerContext.js';

export function parseAliasValue(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<AliasValue, ValidationError[]> {
  if (typeof value !== 'string') {
    return Effect.fail([
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
    return Effect.fail([
      new ValidationError({
        type: 'Value',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be wrapped in curly braces to form an alias reference, like: "{my.alias}". Got "${value}".`,
      }),
    ]);
  }
  return Effect.succeed(value as AliasValue);
}
