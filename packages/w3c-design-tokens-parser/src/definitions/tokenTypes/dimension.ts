import { Either } from 'effect';
import { Dimension } from 'design-tokens-format-module';

import { ValidationError } from '@nclsndr/design-tokens-utils';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { withAlias } from '../internals/withAlias.js';

export const dimensionValuePattern = '^(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:px|rem)$';

export function parseDimensionStringRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<AnalyzedValue<Dimension.Value>, ValidationError[]> {
  if (typeof value !== 'string') {
    return Either.left([
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
    return Either.left([
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
  return Either.right({
    raw: value as Dimension.RawValue,
    toReferences: [],
  });
}

export const parseAliasableDimensionValue = withAlias(
  parseDimensionStringRawValue,
);
