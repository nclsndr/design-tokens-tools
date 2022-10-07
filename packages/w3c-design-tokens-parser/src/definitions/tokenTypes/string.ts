import { Result } from '@swan-io/boxed';

import { ValidationError } from '../../utils/validationError.js';
import { WithAliasValueSignature } from '../AliasSignature.js';
import { TokenSignature } from '../TokenSignature.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export type StringRawValue = string;
export type StringValue = WithAliasValueSignature<StringRawValue>;

export type StringToken = TokenSignature<'string', StringValue>;

export function parseRawStringValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<StringRawValue>, ValidationError[]> {
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
  return Result.Ok({
    raw: value,
    toReferences: [],
  });
}

export const parseAliasableStringValue = withAlias(parseRawStringValue);
