import { Result } from '@swan-io/boxed';
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
  parse: (value: unknown, ctx: AnalyzerContext) => Result<R, E>,
): (
  value: unknown,
  ctx: AnalyzerContext,
) => Result<R | AnalyzedValue<AliasValue>, E | ValidationError[]> {
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
