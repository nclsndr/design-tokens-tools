import { Result } from '@swan-io/boxed';
import { Color } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export const hexadecimalColorValuePattern =
  '^#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6})$';

export function parseColorStringRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<Color.RawValue>, ValidationError[]> {
  if (typeof value !== 'string') {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a string. Got "${typeof value}".`,
      }),
    ]);
  }
  if (!value.match(hexadecimalColorValuePattern)) {
    return Result.Error([
      new ValidationError({
        type: 'Value',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must start with "#" and have a length of 6 or 8. Got: "${value}".`,
      }),
    ]);
  }
  return Result.Ok({
    raw: value as Color.RawValue,
    toReferences: [],
  });
}

export const parseAliasableColorValue = withAlias(parseColorStringRawValue);
