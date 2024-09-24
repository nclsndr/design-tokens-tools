import { Effect } from 'effect';
import { type JSON } from 'design-tokens-format-module';

import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { ValidationError } from '../../utils/validationError.js';

export function parseTreeNode(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<JSON.Object, ValidationError[]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return Effect.fail([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be an object. Got "${Array.isArray(value) ? 'array' : typeof value}".`,
      }),
    ]);
  }
  return Effect.succeed(value as JSON.Object);
}
