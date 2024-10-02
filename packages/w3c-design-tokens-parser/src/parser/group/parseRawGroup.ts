import { Either } from 'effect';

import { parseTreeNodeExtensions } from '../tree/parseTreeNodeExtensions.js';
import { ValidationError } from '@nclsndr/design-tokens-utils';
import { AnalyzedGroup } from './AnalyzedGroup.js';
import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { parseTreeNode } from '../tree/parseTreeNode.js';
import { parseTreeNodeDescription } from '../tree/parseTreeNodeDescription.js';
import { parseTokenTypeName } from '../token/parseTokenTypeName.js';

export function parseRawGroup(
  value: object,
  ctx: AnalyzerContext,
): Either.Either<AnalyzedGroup, Array<ValidationError>> {
  return Either.flatMap(parseTreeNode(value, ctx), (node) => {
    const { $type, $description, $extensions, ...rest } = node;

    const maybeTokenType = parseTokenTypeName($type, {
      allowUndefined: true,
      varName: `${ctx.varName}.$type`,
      nodeId: ctx.nodeId,
      path: ctx.path,
      nodeKey: '$type',
    });
    const maybeDescription = parseTreeNodeDescription($description, {
      varName: `${ctx.varName}.$description`,
      nodeId: ctx.nodeId,
      path: ctx.path,
      nodeKey: '$description',
    });
    const maybeExtensions = parseTreeNodeExtensions($extensions, {
      varName: `${ctx.varName}.$extensions`,
      nodeId: ctx.nodeId,
      path: ctx.path,
      nodeKey: '$extensions',
    });

    if (
      Either.isLeft(maybeTokenType) ||
      Either.isLeft(maybeDescription) ||
      Either.isLeft(maybeExtensions)
    ) {
      return Either.left([
        ...(Either.isLeft(maybeTokenType) ? maybeTokenType.left : []),
        ...(Either.isLeft(maybeDescription) ? maybeDescription.left : []),
        ...(Either.isLeft(maybeExtensions) ? maybeExtensions.left : []),
      ]);
    }

    return Either.right({
      id: ctx.nodeId,
      path: ctx.path,
      tokenType: maybeTokenType.right,
      childrenCount: Object.keys(rest).length,
      description: maybeDescription.right,
      extensions: maybeExtensions.right,
    } satisfies AnalyzedGroup);
  });
}
