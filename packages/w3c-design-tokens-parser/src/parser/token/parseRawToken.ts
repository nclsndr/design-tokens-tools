import { Result } from '@swan-io/boxed';
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
): Result<AnalyzedToken, Array<ValidationError>> {
  const {
    $type, // only  for destructuring, ctx.resolvedType is used instead
    $value,
    $description,
    $extensions,
    ...rest
  } = rawJsonToken;

  // Accumulates validation errors
  const validationErrors: Array<ValidationError> = [];

  // No extra properties allowed
  if (Object.keys(rest).length > 0) {
    validationErrors.push(
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
    );
  }

  return Result.all([
    recursivelyResolveTokenType(ctx.jsonTokenTree, ctx.path)
      .tapError((e) => validationErrors.push(...e))
      .flatMap(({ resolvedType: type, resolution: resolutionType }) =>
        getTokenValueParser(type)($value, {
          varName: `${ctx.varName}.$value`,
          nodeId: ctx.nodeId,
          path: ctx.path,
          valuePath: [],
          nodeKey: '$value',
        })
          .map((value) => ({ resolutionType, type, value }))
          .tapError((e) => validationErrors.push(...e)),
      ),
    parseTreeNodeDescription($description, {
      varName: `${ctx.varName}.$description`,
      nodeId: ctx.nodeId,
      path: ctx.path,
      nodeKey: '$description',
    }).tapError((e) => validationErrors.push(...e)),
    parseTreeNodeExtensions($extensions, {
      varName: `${ctx.varName}.$extensions`,
      nodeId: ctx.nodeId,
      path: ctx.path,
      nodeKey: '$extensions',
    }).tapError((e) => validationErrors.push(...e)),
  ])
    .flatMap(([{ type, resolutionType, value }, description, extensions]) => {
      return Result.Ok(
        new AnalyzedToken(
          ctx.nodeId,
          ctx.path,
          type,
          value,
          resolutionType,
          description,
          extensions,
        ),
      );
    })
    .flatMapError(() => Result.Error(validationErrors));
}
