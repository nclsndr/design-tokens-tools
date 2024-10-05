import { Either } from 'effect';
import { ValidationError } from '@nclsndr/design-tokens-utils';
import { Json as JSONTypes } from 'design-tokens-format-module';

import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { parseTreeNode } from './parseTreeNode.js';

export function parseRawInput(
  input: unknown,
  ctx: AnalyzerContext,
): Either.Either<JSONTypes.Object, Array<ValidationError>> {
  if (typeof input === 'string') {
    try {
      return parseTreeNode(JSON.parse(input), ctx);
    } catch (error) {
      return Either.left([
        new ValidationError({
          nodeId: '',
          type: 'Computation',
          message: 'Failed to parse JSON string',
          treePath: [],
        }),
      ]);
    }
  }
  return parseTreeNode(input, ctx);
}
