import { Either } from 'effect';
import { Border } from 'design-tokens-format-module';

import { parseAliasableColorValue } from './color.js';
import { parseAliasableStrokeStyleValue } from './strokeStyle.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { ValidationError } from '@nclsndr/design-tokens-utils';
import { parseAliasableDimensionValue } from './dimension.js';
import { makeParseObject } from '../../parser/utils/parseObject.js';
import { withAlias } from '../internals/withAlias.js';

const parseBorderRawValue = makeParseObject({
  color: { parser: parseAliasableColorValue },
  width: { parser: parseAliasableDimensionValue },
  style: { parser: parseAliasableStrokeStyleValue },
});

export const parseAliasableBorderValue = withAlias(
  (
    value: unknown,
    ctx: AnalyzerContext,
  ): Either.Either<AnalyzedValue<Border.RawValue>, Array<ValidationError>> => {
    return parseBorderRawValue(value, ctx).pipe(
      Either.map(
        (analyzed) =>
          ({
            raw: {
              color: analyzed.color.raw,
              width: analyzed.width.raw,
              style: analyzed.style.raw,
            },
            toReferences: [
              ...analyzed.color.toReferences,
              ...analyzed.width.toReferences,
              ...analyzed.style.toReferences,
            ],
          }) as AnalyzedValue<Border.RawValue>,
      ),
    );
  },
);
