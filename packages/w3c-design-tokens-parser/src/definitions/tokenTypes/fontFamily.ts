import { Effect } from 'effect';
import { FontFamily } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export function parseRawFontFamilyValue(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<AnalyzedValue<FontFamily.RawValue>, ValidationError[]> {
  if (Array.isArray(value)) {
    const types = value.reduce<Set<string>>((acc, v) => {
      if (typeof v !== 'string') {
        acc.add(typeof v);
      }
      return acc;
    }, new Set());
    if (types.size > 0) {
      return Effect.fail([
        new ValidationError({
          type: 'Type',
          nodeId: ctx.nodeId,
          treePath: ctx.path,
          nodeKey: ctx.nodeKey,
          valuePath: ctx.valuePath,
          message: `${ctx.varName} must only contain strings. Got ${Array.from(
            types,
          )
            .map((t) => `"${t}"`)
            .join(' | ')}.`,
        }),
      ]);
    }
  } else if (typeof value !== 'string') {
    return Effect.fail([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a string or an array of strings. Got "${typeof value}".`,
      }),
    ]);
  }
  return Effect.succeed({
    raw: value,
    toReferences: [],
  });
}

export const parseAliasableFontFamilyValue = withAlias(parseRawFontFamilyValue);
