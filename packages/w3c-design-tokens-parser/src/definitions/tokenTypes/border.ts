import { Effect } from 'effect';
import { Border } from 'design-tokens-format-module';

import { parseAliasableColorValue } from './color.js';
import { parseAliasableStrokeStyleValue } from './strokeStyle.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { ValidationError } from '../../utils/validationError.js';
import { parseAliasableDimensionValue } from './dimension.js';
import { makeParseObject } from '../../parser/utils/parseObject.js';
import { withAlias } from '../withAlias.js';

const parseBorderRawValue = makeParseObject({
  color: { parser: parseAliasableColorValue },
  width: { parser: parseAliasableDimensionValue },
  style: { parser: parseAliasableStrokeStyleValue },
});

export const parseAliasableBorderValue = withAlias(
  (
    value: unknown,
    ctx: AnalyzerContext,
  ): Effect.Effect<AnalyzedValue<Border.RawValue>, Array<ValidationError>> => {
    return parseBorderRawValue(value, ctx).pipe(
      Effect.map(
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
