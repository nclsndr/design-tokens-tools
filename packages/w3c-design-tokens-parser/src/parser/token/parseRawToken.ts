import { Effect, Either } from 'effect';
import { type JSON } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { parseTreeNodeExtensions } from '../tree/parseTreeNodeExtensions.js';
import { AnalyzedToken } from './AnalyzedToken.js';
import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { recursivelyResolveTokenType } from './recursivelyResolveTokenType.js';
import { parseTreeNodeDescription } from '../tree/parseTreeNodeDescription.js';
import { getTokenValueParser } from '../../definitions/getTokenValueParser.js';

export function parseRawToken(
  rawJsonToken: JSON.Object,
  ctx: {
    jsonTokenTree: JSON.Object;
  } & AnalyzerContext,
): Effect.Effect<AnalyzedToken, Array<ValidationError>> {
  const {
    $type, // only  for destructuring, resolvedType is used instead
    $value,
    $description,
    $extensions,
    ...rest
  } = rawJsonToken;

  // No extra properties allowed
  if (Object.keys(rest).length > 0) {
    return Effect.fail([
      new ValidationError({
        type: 'Value',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        message: `${ctx.varName} has unexpected properties: ${Object.entries(
          rest,
        )
          .map(([k, v]) => `"${k}": ${JSON.stringify(v)}`)
          .join(', ')}.`,
      }),
    ]);
  }

  return Effect.all(
    [
      recursivelyResolveTokenType(ctx.jsonTokenTree, ctx.path).pipe(
        Effect.flatMap(({ resolvedType, resolution }) =>
          getTokenValueParser(resolvedType)($value, {
            varName: `${ctx.varName}.$value`,
            nodeId: ctx.nodeId,
            path: ctx.path,
            valuePath: [],
            nodeKey: '$value',
          }).pipe(Effect.map((value) => ({ resolvedType, resolution, value }))),
        ),
      ),
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
      ([maybeResolvedTypeAndValue, maybeDescription, maybeExtensions]) => {
        if (
          Either.isLeft(maybeResolvedTypeAndValue) ||
          Either.isLeft(maybeDescription) ||
          Either.isLeft(maybeExtensions)
        ) {
          return Effect.fail([
            ...(Either.isLeft(maybeResolvedTypeAndValue)
              ? maybeResolvedTypeAndValue.left
              : []),
            ...(Either.isLeft(maybeDescription) ? maybeDescription.left : []),
            ...(Either.isLeft(maybeExtensions) ? maybeExtensions.left : []),
          ]);
        }

        const { resolvedType, value, resolution } =
          maybeResolvedTypeAndValue.right;

        return Effect.succeed(
          new AnalyzedToken(
            ctx.nodeId,
            ctx.path,
            resolvedType,
            value,
            resolution,
            maybeDescription.right,
            maybeExtensions.right,
          ),
        );
      },
    ),
  );
}
