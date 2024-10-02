import { Either } from 'effect';
import { type Json } from 'design-tokens-format-module';

import { ValidationError } from '@nclsndr/design-tokens-utils';
import { parseTreeNodeExtensions } from '../tree/parseTreeNodeExtensions.js';
import { AnalyzedToken } from './AnalyzedToken.js';
import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { recursivelyResolveTokenType } from './recursivelyResolveTokenType.js';
import { parseTreeNodeDescription } from '../tree/parseTreeNodeDescription.js';
import { getTokenValueParser } from '../../definitions/getTokenValueParser.js';

export function parseRawToken(
  rawJsonToken: Json.Object,
  ctx: {
    jsonTokenTree: Json.Object;
  } & AnalyzerContext,
): Either.Either<AnalyzedToken, Array<ValidationError>> {
  const {
    $type, // only  for destructuring, resolvedType is used instead
    $value,
    $description,
    $extensions,
    ...rest
  } = rawJsonToken;

  // No extra properties allowed
  if (Object.keys(rest).length > 0) {
    return Either.left([
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

  const maybeResolvedTypeAndValue = recursivelyResolveTokenType(
    ctx.jsonTokenTree,
    ctx.path,
  ).pipe(
    Either.flatMap(({ resolvedType, resolution }) =>
      getTokenValueParser(resolvedType)($value, {
        varName: `${ctx.varName}.$value`,
        nodeId: ctx.nodeId,
        path: ctx.path,
        valuePath: [],
        nodeKey: '$value',
      }).pipe(Either.map((value) => ({ resolvedType, resolution, value }))),
    ),
  );
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
    Either.isLeft(maybeResolvedTypeAndValue) ||
    Either.isLeft(maybeDescription) ||
    Either.isLeft(maybeExtensions)
  ) {
    return Either.left([
      ...(Either.isLeft(maybeResolvedTypeAndValue)
        ? maybeResolvedTypeAndValue.left
        : []),
      ...(Either.isLeft(maybeDescription) ? maybeDescription.left : []),
      ...(Either.isLeft(maybeExtensions) ? maybeExtensions.left : []),
    ]);
  }

  const { resolvedType, value, resolution } = maybeResolvedTypeAndValue.right;

  return Either.right(
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
}
