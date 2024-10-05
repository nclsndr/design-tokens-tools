import { Either } from 'effect';
import {
  Dimension,
  StrokeStyle,
  AliasValue,
} from 'design-tokens-format-module';

import { parseAliasableDimensionValue } from './dimension.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { ValidationError } from '@nclsndr/design-tokens-utils';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { withAlias } from '../internals/withAlias.js';
import { makeParseObject } from '../../parser/utils/parseObject.js';
import { mergeEitherItems } from '../../parser/utils/mergeEithers.js';

export const strokeStyleStringValues = [
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'outset',
  'inset',
] as const;
export type StrokeStyleStringValues = (typeof strokeStyleStringValues)[number];

export const strokeStyleLineCapValues = ['round', 'butt', 'square'] as const;
export type StrokeStyleLineCapValues =
  (typeof strokeStyleLineCapValues)[number];

export function parseStrokeStyleLineCapValue(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<StrokeStyleLineCapValues, ValidationError[]> {
  if (typeof value !== 'string') {
    return Either.left([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be a string. Got "${typeof value}".`,
      }),
    ]);
  }
  if (!strokeStyleLineCapValues.includes(value as any)) {
    return Either.left([
      new ValidationError({
        type: 'Value',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be one of: ${strokeStyleLineCapValues
          .map((x) => `"${x}"`)
          .join(', ')}. Got "${value}".`,
      }),
    ]);
  }
  return Either.right(value as StrokeStyleLineCapValues);
}

export function parseStrokeStyleDashArrayValue(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<
  Array<AnalyzedValue<Dimension.Value> | AnalyzedValue<AliasValue>>,
  Array<ValidationError>
> {
  if (!Array.isArray(value)) {
    return Either.left([
      new ValidationError({
        type: 'Type',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be an array. Got "${typeof value}".`,
      }),
    ]);
  }

  return mergeEitherItems(
    value.map((v, i) =>
      parseAliasableDimensionValue(v, {
        ...ctx,
        valuePath: (ctx.valuePath ?? []).concat([i]),
        varName: `${ctx.varName}[${i}]`,
      }),
    ),
    [] as Array<AnalyzedValue<Dimension.Value> | AnalyzedValue<AliasValue>>,
    (a, c) => {
      a.push(c);
    },
  );
}

const parseStrokeObjectValue = makeParseObject({
  dashArray: { parser: parseStrokeStyleDashArrayValue },
  lineCap: { parser: parseStrokeStyleLineCapValue },
});

export function parseStrokeStyleRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Either.Either<AnalyzedValue<StrokeStyle.RawValue>, Array<ValidationError>> {
  if (typeof value === 'string') {
    if (strokeStyleStringValues.includes(value as any)) {
      return Either.right({
        raw: value as StrokeStyle.RawValue,
        toReferences: [],
      });
    }
    return Either.left([
      new ValidationError({
        type: 'Value',
        nodeId: ctx.nodeId,
        treePath: ctx.path,
        nodeKey: ctx.nodeKey,
        valuePath: ctx.valuePath,
        message: `${ctx.varName} must be one of: ${strokeStyleStringValues.map((x) => `"${x}"`).join(', ')}. Got "${value}".`,
      }),
    ]);
  } else if (typeof value === 'object' && value !== null) {
    return parseStrokeObjectValue(value, ctx).pipe(
      Either.map((analyzed) => ({
        raw: {
          dashArray: analyzed.dashArray.map((x) => x.raw),
          lineCap: analyzed.lineCap,
        },
        toReferences: analyzed.dashArray.flatMap((x) => x.toReferences),
      })),
    );
  }
  return Either.left([
    new ValidationError({
      type: 'Type',
      nodeId: ctx.nodeId,
      treePath: ctx.path,
      nodeKey: ctx.nodeKey,
      valuePath: ctx.valuePath,
      message: `${ctx.varName} must be a string or an object. Got "${typeof value}".`,
    }),
  ]);
}

export const parseAliasableStrokeStyleValue = withAlias(
  parseStrokeStyleRawValue,
);
