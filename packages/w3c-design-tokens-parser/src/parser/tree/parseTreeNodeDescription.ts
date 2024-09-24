import { Effect } from 'effect';

import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { ValidationError } from '../../utils/validationError.js';

export function parseTreeNodeDescription(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<string | undefined, ValidationError[]> {
  if (value === undefined) return Effect.succeed(undefined);
  if (typeof value !== 'string') {
    return Effect.fail([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        message: `${ctx.varName} must be a string. Got "${typeof value}".`,
      }),
    ]);
  }
  return Effect.succeed(value);
}
