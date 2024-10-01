import { Either } from 'effect';
import { type Json } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzerContext } from '../utils/AnalyzerContext.js';

export function parseTreeNodeExtensions(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<Json.Object | undefined, ValidationError[]> {
  if (value === undefined) return Either.right(undefined);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return Either.left([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        message: `${ctx.varName} must be an object. Got "${typeof value}".`,
      }),
    ]);
  }
  return Either.right(value as Json.Object);
}
