import { Either } from 'effect';
import { type JSON } from 'design-tokens-format-module';

import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { ValidationError } from '../../utils/validationError.js';

export function parseTreeNode(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<JSON.Object, ValidationError[]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return Either.left([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be an object. Got "${Array.isArray(value) ? 'array' : typeof value}".`,
      }),
    ]);
  }
  return Either.right(value as JSON.Object);
}
