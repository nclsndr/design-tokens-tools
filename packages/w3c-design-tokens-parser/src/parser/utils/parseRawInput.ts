import { AnalyzerContext } from './AnalyzerContext.js';
import { Either } from 'effect';
import { JSON as JSONTypes } from 'design-tokens-format-module';
import { ValidationError } from '../../utils/validationError.js';
import { parseTreeNode } from '../tree/parseTreeNode.js';

export function parseRawInput(
  input: unknown,
  ctx: AnalyzerContext,
): Either.Either<JSONTypes.Object, Array<ValidationError>> {
  if (typeof input === 'string') {
    try {
      return Either.right(JSON.parse(input) as JSONTypes.Object);
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
