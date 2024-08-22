import { Result } from '@swan-io/boxed';
import { Typography } from 'design-tokens-format-module';

import { parseAliasableFontFamilyValue } from './fontFamily.js';
import { parseAliasableNumberValue } from './number.js';
import { parseAliasableFontWeightValue } from './fontWeight.js';
import { parseAliasableDimensionValue } from './dimension.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { makeParseObject } from '../../parser/internals/parseObject.js';
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
  ): Result<AnalyzedValue<Typography.RawValue>, Array<ValidationError>> => {
    return parseTypographyRawValue(value, ctx).match({
      Ok: (analyzed) => {
        return Result.Ok({
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
        });
      },
      Error: (err) => {
        return Result.Error(err);
      },
    });
  },
);
