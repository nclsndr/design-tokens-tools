import { Result } from '@swan-io/boxed';
import {
  Dimension,
  StrokeStyle,
  AliasValue,
} from 'design-tokens-format-module';

import { parseAliasableDimensionValue } from './dimension.js';
import { AnalyzerContext } from '../../parser/utils/AnalyzerContext.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/token/AnalyzedToken.js';
import { withAlias } from '../withAlias.js';
import { makeParseObject } from '../../parser/utils/parseObject.js';

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
): Result<StrokeStyleLineCapValues, ValidationError[]> {
  if (typeof value !== 'string') {
    return Result.Error([
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
    return Result.Error([
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
  return Result.Ok(value as StrokeStyleLineCapValues);
}

export function parseStrokeStyleDashArrayValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<
  Array<AnalyzedValue<Dimension.Value> | AnalyzedValue<AliasValue>>,
  Array<ValidationError>
> {
  if (!Array.isArray(value)) {
    return Result.Error([
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

  const analyzedValueResults = value.map((v, i) =>
    parseAliasableDimensionValue(v, {
      ...ctx,
      valuePath: (ctx.valuePath ?? []).concat([i]),
      varName: `${ctx.varName}[${i}]`,
    }),
  );

  const errors = analyzedValueResults
    .filter((r) => r.isError())
    .map((r) => r.error)
    .flat();
  if (errors.length > 0) {
    return Result.Error(errors);
  }

  return Result.Ok(
    analyzedValueResults.reduce<
      Array<AnalyzedValue<Dimension.Value> | AnalyzedValue<AliasValue>>
    >((acc, c) => {
      if (c.isOk()) acc.push(c.value);
      return acc;
    }, []),
  );
}

const parseStrokeObjectValue = makeParseObject({
  dashArray: { parser: parseStrokeStyleDashArrayValue },
  lineCap: { parser: parseStrokeStyleLineCapValue },
});

export function parseStrokeStyleRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Result<AnalyzedValue<StrokeStyle.RawValue>, Array<ValidationError>> {
  if (typeof value === 'string') {
    if (strokeStyleStringValues.includes(value as any)) {
      return Result.Ok({
        raw: value as StrokeStyle.RawValue,
        toReferences: [],
      });
    }
    return Result.Error([
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
    return parseStrokeObjectValue(value, ctx).map((analyzed) => ({
      raw: {
        dashArray: analyzed.dashArray.map((x) => x.raw),
        lineCap: analyzed.lineCap,
      },
      toReferences: analyzed.dashArray.flatMap((x) => x.toReferences),
    }));
  }
  return Result.Error([
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
