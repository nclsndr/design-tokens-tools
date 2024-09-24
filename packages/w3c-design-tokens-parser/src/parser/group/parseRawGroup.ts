import { Effect, Either } from 'effect';

import { parseTreeNodeExtensions } from '../tree/parseTreeNodeExtensions.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedGroup } from './AnalyzedGroup.js';
import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { parseTreeNode } from '../tree/parseTreeNode.js';
import { parseTreeNodeDescription } from '../tree/parseTreeNodeDescription.js';
import { parseTokenTypeName } from '../../definitions/parseTokenTypeName.js';

export function parseRawGroup(
  value: object,
  ctx: AnalyzerContext,
): Effect.Effect<AnalyzedGroup, Array<ValidationError>> {
  return parseTreeNode(value, ctx).pipe(
    Effect.flatMap((node) => {
      const { $type, $description, $extensions, ...rest } = node;

      return Effect.all(
        [
          parseTokenTypeName($type, {
            allowUndefined: true,
            varName: `${ctx.varName}.$type`,
            nodeId: ctx.nodeId,
            path: ctx.path,
            nodeKey: '$type',
          }),
          parseTreeNodeDescription($description, {
            varName: `${ctx.varName}.$description`,
            nodeId: ctx.nodeId,
            path: ctx.path,
            nodeKey: '$description',
          }),
          parseTreeNodeExtensions($extensions, {
            varName: `${ctx.varName}.$extensions`,
            nodeId: ctx.nodeId,
            path: ctx.path,
            nodeKey: '$extensions',
          }),
        ],
        {
          concurrency: 'unbounded',
          mode: 'either',
        },
      ).pipe(
        Effect.flatMap(
          ([maybeTokenType, maybeDescription, maybeExtensions]) => {
            if (
              Either.isLeft(maybeTokenType) ||
              Either.isLeft(maybeDescription) ||
              Either.isLeft(maybeExtensions)
            ) {
              return Effect.fail([
                ...(Either.isLeft(maybeTokenType) ? maybeTokenType.left : []),
                ...(Either.isLeft(maybeDescription)
                  ? maybeDescription.left
                  : []),
                ...(Either.isLeft(maybeExtensions) ? maybeExtensions.left : []),
              ]);
            }

            return Effect.succeed({
              id: ctx.nodeId,
              path: ctx.path,
              tokenType: maybeTokenType.right,
              childrenCount: Object.keys(rest).length,
              description: maybeDescription.right,
              extensions: maybeExtensions.right,
            } satisfies AnalyzedGroup);
          },
        ),
      );
    }),
  );
}
