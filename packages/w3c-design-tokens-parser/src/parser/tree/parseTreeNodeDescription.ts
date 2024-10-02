import { Either } from 'effect';

import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { ValidationError } from '@nclsndr/design-tokens-utils';

export function parseTreeNodeDescription(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<string | undefined, ValidationError[]> {
  if (value === undefined) return Either.right(undefined);
  if (typeof value !== 'string') {
    return Either.left([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        message: `${ctx.varName} must be a string. Got "${typeof value}".`,
      }),
    ]);
  }
  return Either.right(value);
}
