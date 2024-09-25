import { Either } from 'effect';
import { Typography } from 'design-tokens-format-module';

import { parseAliasableFontFamilyValue } from './fontFamily.js';
import { parseAliasableNumberValue } from './number.js';
import { parseAliasableFontWeightValue } from './fontWeight.js';
import { parseAliasableDimensionValue } from './dimension.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { makeParseObject } from '../../parser/utils/parseObject.js';
import { withAlias } from '../withAlias.js';

const parseTypographyRawValue = makeParseObject({
  fontFamily: { parser: parseAliasableFontFamilyValue },
  fontSize: { parser: parseAliasableDimensionValue },
  fontWeight: { parser: parseAliasableFontWeightValue },
  letterSpacing: { parser: parseAliasableDimensionValue },
  lineHeight: { parser: parseAliasableNumberValue },
});

export const parseAliasableTypographyValue = withAlias(
  (
    value: unknown,
    ctx,
  ): Either.Either<
    AnalyzedValue<Typography.RawValue>,
    Array<ValidationError>
  > => {
    return parseTypographyRawValue(value, ctx).pipe(
      Either.map((analyzed) => ({
        raw: {
          fontFamily: analyzed.fontFamily.raw,
          fontSize: analyzed.fontSize.raw,
          fontWeight: analyzed.fontWeight.raw,
          letterSpacing: analyzed.letterSpacing.raw,
          lineHeight: analyzed.lineHeight.raw,
        },
        toReferences: [
          ...analyzed.fontFamily.toReferences,
          ...analyzed.fontSize.toReferences,
          ...analyzed.fontWeight.toReferences,
          ...analyzed.letterSpacing.toReferences,
          ...analyzed.lineHeight.toReferences,
        ],
      })),
    );
  },
);
