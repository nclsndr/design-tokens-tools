import { Result } from '@swan-io/boxed';
import { Dimension } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export const dimensionValuePattern = '^(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:px|rem)$';

export function parseDimensionStringRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<Dimension.Value>, ValidationError[]> {
  if (typeof value !== 'string') {
    return Result.Error([
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
  if (!value.match(dimensionValuePattern)) {
    return Result.Error([
      new ValidationError({
        type: 'Value',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a number followed by "px" or "rem". Got: "${value}".`,
      }),
    ]);
  }
  return Result.Ok({
    raw: value as Dimension.RawValue,
    toReferences: [],
  });
}

export const parseAliasableDimensionValue = withAlias(
  parseDimensionStringRawValue,
);
