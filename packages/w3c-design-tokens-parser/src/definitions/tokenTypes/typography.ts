import { WithAliasValueSignature } from '../AliasSignature.js';
import {
  FontFamilyValue,
  parseAliasableFontFamilyValue,
} from './fontFamily.js';
import { NumberValue, parseAliasableNumberValue } from './number.js';
import {
  FontWeightValue,
  parseAliasableFontWeightValue,
} from './fontWeight.js';
import { DimensionValue, parseAliasableDimensionValue } from './dimension.js';
import { TokenSignature } from '../TokenSignature.js';
import { Result } from '@swan-io/boxed';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { makeParseObject } from '../../parser/internals/parseObject.js';
import { withAlias } from '../withAlias.js';

export type TypographyValue = WithAliasValueSignature<{
  fontFamily: FontFamilyValue;
  fontSize: DimensionValue;
  fontWeight: FontWeightValue;
  letterSpacing: DimensionValue;
  lineHeight: NumberValue;
}>;

export type TypographyToken = TokenSignature<'typography', TypographyValue>;

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
  ): Result<AnalyzedValue<TypographyValue>, Array<ValidationError>> => {
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
