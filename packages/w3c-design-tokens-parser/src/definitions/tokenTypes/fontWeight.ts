import { Either } from 'effect';
import { FontWeight } from 'design-tokens-format-module';

import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
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
): Either.Either<AnalyzedValue<FontWeight.Value>, ValidationError[]> {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return Either.left([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a string or number. Got "${typeof value}".`,
      }),
    ]);
  }

  if (!fontWeightValues.includes(value as any)) {
    return Either.left([
      new ValidationError({
        type: 'Value',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be one of: ${fontWeightValues
          .map((x) => `"${x}"`)
          .join(', ')}. Got "${value}".`,
      }),
    ]);
  }

  return Either.right({
    raw: value as FontWeight.RawValue,
    toReferences: [],
  });
}

export const parseAliasableFontWeightValue = withAlias(parseFontWeightRawValue);
