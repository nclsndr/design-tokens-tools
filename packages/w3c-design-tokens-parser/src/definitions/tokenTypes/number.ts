import { Result } from '@swan-io/boxed';
import { Number } from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { withAlias } from '../withAlias.js';

export function parseNumberRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<Number.RawValue>, ValidationError[]> {
  if (typeof value !== 'number') {
    return Result.Error([
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
  return Result.Ok({
    raw: value,
    toReferences: [],
  });
}

export const parseAliasableNumberValue = withAlias(parseNumberRawValue);
