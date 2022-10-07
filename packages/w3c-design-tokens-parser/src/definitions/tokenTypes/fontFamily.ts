import { Result } from '@swan-io/boxed';

import { ValidationError } from '../../utils/validationError.js';
import { WithAliasValueSignature } from '../AliasSignature.js';
import { TokenSignature } from '../TokenSignature.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export type FontFamilyRawValue = string | Array<string>;
export type FontFamilyValue = WithAliasValueSignature<FontFamilyRawValue>;

export type FontFamilyToken = TokenSignature<'fontFamily', FontFamilyValue>;

export function parseRawFontFamilyValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<FontFamilyRawValue>, ValidationError[]> {
  if (Array.isArray(value)) {
    const types = value.reduce<Set<string>>((acc, v) => {
      if (typeof v !== 'string') {
        acc.add(typeof v);
      }
      return acc;
    }, new Set());
    if (types.size > 0) {
      return Result.Error([
        new ValidationError({
          type: 'Type',
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
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a string or an array of strings. Got "${typeof value}".`,
      }),
    ]);
  }
  return Result.Ok({
    raw: value,
    toReferences: [],
  });
}

export const parseAliasableFontFamilyValue = withAlias(parseRawFontFamilyValue);
