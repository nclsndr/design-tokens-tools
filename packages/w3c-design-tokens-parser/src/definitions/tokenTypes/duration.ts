import { Result } from '@swan-io/boxed';
import { Duration } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export const durationValuePattern = '^(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:ms|s)$';

export function parseDurationStringRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<Duration.Value>, ValidationError[]> {
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
  if (!value.match(durationValuePattern)) {
    return Result.Error([
      new ValidationError({
        type: 'Value',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a number followed by "px" or "rem". Got: "${value}".`,
      }),
    ]);
  }
  return Result.Ok({
    raw: value as Duration.RawValue,
    toReferences: [],
  });
}

export const parseAliasableDurationValue = withAlias(
  parseDurationStringRawValue,
);
