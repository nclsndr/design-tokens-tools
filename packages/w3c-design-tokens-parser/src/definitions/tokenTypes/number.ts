import { Effect } from 'effect';
import { Number } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export function parseNumberRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<AnalyzedValue<Number.RawValue>, ValidationError[]> {
  if (typeof value !== 'number') {
    return Effect.fail([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a number. Got "${typeof value}".`,
      }),
    ]);
  }
  return Effect.succeed({
    raw: value,
    toReferences: [],
  });
}

export const parseAliasableNumberValue = withAlias(parseNumberRawValue);
