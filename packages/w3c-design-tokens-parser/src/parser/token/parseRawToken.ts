import { Result } from '@swan-io/boxed';

import { ValidationError } from '../../utils/validationError.js';
import { parseTreeNodeExtensions } from '../tree/parseTreeNodeExtensions.js';
import { JSONObject } from '../../definitions/JSONDefinitions.js';
import { AnalyzedToken } from '../internals/AnalyzedToken.js';
import { AnalyzerContext } from '../internals/AnalyzerContext.js';
import { recursivelyResolveTokenType } from './recursivelyResolveTokenType.js';
import { parseTreeNodeDescription } from '../tree/parseTreeNodeDescription.js';
import { getTokenValueParser } from '../../definitions/tokenTypes.js';

export function parseRawToken(
  rawJsonToken: JSONObject,
  ctx: {
    jsonTokenTree: JSONObject;
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
      .flatMap(({ resolvedType: type }) =>
        getTokenValueParser(type)($value, {
          varName: `${ctx.varName}.$value`,
          path: ctx.path,
          valuePath: [],
          nodeKey: '$value',
        })
          .map((value) => ({ type, value }))
          .tapError((e) => validationErrors.push(...e)),
      ),
    parseTreeNodeDescription($description, {
      varName: `${ctx.varName}.$description`,
      path: ctx.path,
      nodeKey: '$description',
    }).tapError((e) => validationErrors.push(...e)),
    parseTreeNodeExtensions($extensions, {
      varName: `${ctx.varName}.$extensions`,
      path: ctx.path,
      nodeKey: '$extensions',
    }).tapError((e) => validationErrors.push(...e)),
  ])
    .flatMap(([{ type, value }, description, extensions]) => {
      return Result.Ok(
        new AnalyzedToken(ctx.path, type, value, description, extensions),
      );
    })
    .flatMapError(() => Result.Error(validationErrors));
}
