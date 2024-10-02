import { Either } from 'effect';
import { Number } from 'design-tokens-format-module';

import { ValidationError } from '@nclsndr/design-tokens-utils';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { withAlias } from '../internals/withAlias.js';

export function parseNumberRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<AnalyzedValue<Number.RawValue>, ValidationError[]> {
  if (typeof value !== 'number') {
    return Either.left([
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
  return Either.right({
    raw: value,
    toReferences: [],
  });
}

export const parseAliasableNumberValue = withAlias(parseNumberRawValue);
