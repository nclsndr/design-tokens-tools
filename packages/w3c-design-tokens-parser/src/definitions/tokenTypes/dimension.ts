import { Result } from '@swan-io/boxed';

import { ValidationError } from '../../utils/validationError.js';
import { TokenSignature } from '../TokenSignature.js';
import { WithAliasValueSignature } from '../AliasSignature.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export type DimensionRawValue = `${number}px` | `${number}rem`;
export type DimensionValue = WithAliasValueSignature<DimensionRawValue>;

export type DimensionToken = TokenSignature<'dimension', DimensionValue>;

export const dimensionValuePattern = '^(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:px|rem)$';

export function parseDimensionStringRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<DimensionValue>, ValidationError[]> {
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
  if (!value.match(dimensionValuePattern)) {
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
    raw: value as DimensionRawValue,
    toReferences: [],
  });
}

export const parseAliasableDimensionValue = withAlias(
  parseDimensionStringRawValue,
);
