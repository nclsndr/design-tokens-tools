import { Effect } from 'effect';
import { type JSON } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzerContext } from '../utils/AnalyzerContext.js';

export function parseTreeNodeExtensions(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<JSON.Object | undefined, ValidationError[]> {
  if (value === undefined) return Effect.succeed(undefined);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return Effect.fail([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        message: `${ctx.varName} must be an object. Got "${typeof value}".`,
      }),
    ]);
  }
  return Effect.succeed(value as JSON.Object);
}
