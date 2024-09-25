import { Either } from 'effect';
import { Color } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export const hexadecimalColorValuePattern =
  '^#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6})$';

export function parseColorStringRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<AnalyzedValue<Color.RawValue>, ValidationError[]> {
  if (typeof value !== 'string') {
    return Either.left([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a string. Got "${typeof value}".`,
      }),
    ]);
  }
  if (!value.match(hexadecimalColorValuePattern)) {
    return Either.left([
      new ValidationError({
        type: 'Value',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must start with "#" and have a length of 6 or 8. Got: "${value}".`,
      }),
    ]);
  }
  return Either.right({
    raw: value as Color.RawValue,
    toReferences: [],
  });
}

export const parseAliasableColorValue = withAlias(parseColorStringRawValue);
