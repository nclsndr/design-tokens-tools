import { Either } from 'effect';
import {
  TokenTypeName,
  tokenTypeNames,
  matchIsTokenTypeName,
} from 'design-tokens-format-module';
import { ValidationError } from '@nclsndr/design-tokens-utils';

import { AnalyzerContext } from '../utils/AnalyzerContext.js';

export function parseTokenTypeName<AllowUndefined extends boolean = false>(
  value: unknown,
  ctx: { allowUndefined: AllowUndefined } & AnalyzerContext,
): Either.Either<
  AllowUndefined extends false ? TokenTypeName : TokenTypeName | undefined,
  ValidationError[]
> {
  if (ctx.allowUndefined && value === undefined) {
    return Either.right(
      undefined as AllowUndefined extends false
        ? TokenTypeName
        : TokenTypeName | undefined,
    );
  }
  if (matchIsTokenTypeName(value)) {
    return Either.right(value);
  }
  return Either.left([
    new ValidationError({
      type: 'Value',
      nodeId: ctx.nodeId,
      treePath: ctx.path,
      valuePath: ctx.valuePath,
      nodeKey: ctx.nodeKey,
      message: `${ctx.varName} must be a valid type among: ${tokenTypeNames.map((v) => `"${v}"`).join(', ')}. Got "${value}".`,
    }),
  ]);
}
