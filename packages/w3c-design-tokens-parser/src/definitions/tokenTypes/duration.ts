import { Effect } from 'effect';
import { Duration } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export const durationValuePattern = '^(?:\\d+(?:\\.\\d*)?|\\.\\d+)ms$';

export function parseDurationStringRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<AnalyzedValue<Duration.Value>, ValidationError[]> {
  if (typeof value !== 'string') {
    return Effect.fail([
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
  if (!value.match(durationValuePattern)) {
    return Effect.fail([
      new ValidationError({
        type: 'Value',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a number followed by "ms". Got: "${value}".`,
      }),
    ]);
  }
  return Effect.succeed({
    raw: value as Duration.RawValue,
    toReferences: [],
  });
}

export const parseAliasableDurationValue = withAlias(
  parseDurationStringRawValue,
);
