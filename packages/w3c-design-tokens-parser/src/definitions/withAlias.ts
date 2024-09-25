import { Either, Option } from 'effect';
import { AliasValue } from 'design-tokens-format-module';

import { AnalyzedValue } from '../parser/token/AnalyzedToken.js';
import { ValidationError } from '../utils/validationError.js';
import { AnalyzerContext } from '../parser/utils/AnalyzerContext.js';
import { captureAliasPath } from '../parser/alias/captureAliasPath.js';
import { parseAliasValue } from '../parser/alias/parseAliasValue.js';

export function withAlias<
  I,
  R extends AnalyzedValue<I>,
  E extends ValidationError[],
>(
  parse: (value: unknown, ctx: AnalyzerContext) => Either.Either<R, E>,
): (
  value: unknown,
  ctx: AnalyzerContext,
) => Either.Either<R | AnalyzedValue<AliasValue>, E | ValidationError[]> {
  return (value: unknown, ctx: AnalyzerContext) => {
    return parseAliasValue(value, ctx).pipe(
      Either.match({
        onRight: (value) =>
          Either.right({
            raw: value,
            toReferences: captureAliasPath(value).pipe(
              Option.match({
                onSome: (path) => [
                  {
                    fromTreePath: ctx.path,
                    fromValuePath: ctx.valuePath ?? [],
                    toTreePath: path,
                  },
                ],
                onNone: () => [],
              }),
            ),
          }),
        onLeft: (aliasErrors) =>
          Either.mapLeft(parse(value, ctx), (parserErrors) =>
            parserErrors.length > 0 ? parserErrors : aliasErrors,
          ),
      }),
    );
  };
}
