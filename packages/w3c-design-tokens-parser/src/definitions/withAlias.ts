import { Result } from '@swan-io/boxed';

import { AnalyzedValue } from '../parser/internals/AnalyzedToken.js';
import { ValidationError } from '../utils/validationError.js';
import { AnalyzerContext } from '../parser/internals/AnalyzerContext.js';
import { AliasValueSignature } from './AliasSignature.js';
import { captureAliasPath } from '../parser/alias/captureAliasPath.js';
import { parseAliasValue } from '../parser/alias/parseAliasValue.js';

export function withAlias<
  I,
  R extends AnalyzedValue<I>,
  E extends ValidationError[],
>(
  parse: (value: unknown, ctx: AnalyzerContext) => Result<R, E>,
): (
  value: unknown,
  ctx: AnalyzerContext,
) => Result<R | AnalyzedValue<AliasValueSignature>, E | ValidationError[]> {
  return (value: unknown, ctx: AnalyzerContext) => {
    return parseAliasValue(value, ctx)
      .map((value) => ({
        raw: value,
        toReferences: captureAliasPath(value).match({
          Some: (path) => [
            {
              fromTreePath: ctx.path,
              fromValuePath: ctx.valuePath ?? [],
              toTreePath: path,
            },
          ],
          None: () => [],
        }),
      }))
      .flatMapError((aliasErrors) =>
        parse(value, ctx).mapError((parserErrors) =>
          parserErrors.length > 0 ? parserErrors : aliasErrors,
        ),
      );
  };
}
