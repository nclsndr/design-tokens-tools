import { Result } from '@swan-io/boxed';
import { FontWeight } from 'design-tokens-format-module';

import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { ValidationError } from '../../utils/validationError.js';
import { withAlias } from '../withAlias.js';

export const fontWeightValues = [
  100,
  'thin',
  'hairline',
  200,
  'extra-light',
  'ultra-light',
  300,
  'light',
  400,
  'normal',
  'regular',
  'book',
  500,
  'medium',
  600,
  'semi-bold',
  'demi-bold',
  700,
  'bold',
  800,
  'extra-bold',
  'ultra-bold',
  900,
  'black',
  'heavy',
  950,
  'extra-black',
  'ultra-black',
] as const;

export function parseFontWeightRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<FontWeight.Value>, ValidationError[]> {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return Result.Error([
      new ValidationError({
        type: 'Type',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a string or number. Got "${typeof value}".`,
      }),
    ]);
  }

  if (!fontWeightValues.includes(value as any)) {
    return Result.Error([
      new ValidationError({
        type: 'Value',
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be one of: ${fontWeightValues
          .map((x) => `"${x}"`)
          .join(', ')}. Got "${value}".`,
      }),
    ]);
  }

  return Result.Ok({
    raw: value as FontWeight.RawValue,
    toReferences: [],
  });
}

export const parseAliasableFontWeightValue = withAlias(parseFontWeightRawValue);
