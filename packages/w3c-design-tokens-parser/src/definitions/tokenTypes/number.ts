import { Result } from '@swan-io/boxed';

import { ValidationError } from '../../utils/validationError.js';
import { TokenSignature } from '../TokenSignature.js';
import { WithAliasValueSignature } from '../AliasSignature.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export type NumberRawValue = number;
export type NumberValue = WithAliasValueSignature<NumberRawValue>;

export type NumberToken = TokenSignature<'number', NumberValue>;

export function parseNumberRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<number>, ValidationError[]> {
  if (typeof value !== 'number') {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a number. Got "${typeof value}".`,
      }),
    ]);
  }
  return Result.Ok({
    raw: value,
    toReferences: [],
  });
}

export const parseAliasableNumberValue = withAlias(parseNumberRawValue);
