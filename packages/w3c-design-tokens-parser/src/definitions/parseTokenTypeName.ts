import { Effect } from 'effect';
import {
  TokenTypeName,
  tokenTypeNames,
  matchIsTokenTypeName,
} from 'design-tokens-format-module';

import { AnalyzerContext } from '../parser/utils/AnalyzerContext.js';
import { ValidationError } from '../utils/validationError.js';

export function parseTokenTypeName<AllowUndefined extends boolean = false>(
  value: unknown,
  ctx: { allowUndefined: AllowUndefined } & AnalyzerContext,
): Effect.Effect<
  AllowUndefined extends false ? TokenTypeName : TokenTypeName | undefined,
  ValidationError[]
> {
  if (ctx.allowUndefined && value === undefined) {
    return Effect.succeed(
      undefined as AllowUndefined extends false
        ? TokenTypeName
        : TokenTypeName | undefined,
    );
  }
  if (matchIsTokenTypeName(value)) {
    return Effect.succeed(value);
  }
  return Effect.fail([
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
