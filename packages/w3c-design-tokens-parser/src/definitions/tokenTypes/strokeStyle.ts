import { Effect, Either } from 'effect';
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
): Effect.Effect<StrokeStyleLineCapValues, ValidationError[]> {
  if (typeof value !== 'string') {
    return Effect.fail([
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
    return Effect.fail([
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
  return Effect.succeed(value as StrokeStyleLineCapValues);
}

export function parseStrokeStyleDashArrayValue(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<
  Array<AnalyzedValue<Dimension.Value> | AnalyzedValue<AliasValue>>,
  Array<ValidationError>
> {
  if (!Array.isArray(value)) {
    return Effect.fail([
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

  const analyzedValueEffects = value.map((v, i) =>
    parseAliasableDimensionValue(v, {
      ...ctx,
      valuePath: (ctx.valuePath ?? []).concat([i]),
      varName: `${ctx.varName}[${i}]`,
    }),
  );

  return Effect.all(analyzedValueEffects, {
    concurrency: 'unbounded',
    mode: 'either',
  }).pipe(
    Effect.flatMap((analyzedValueEitherItems) => {
      const errors = analyzedValueEitherItems.reduce<Array<ValidationError>>(
        (acc, c) => {
          if (Either.isLeft(c)) {
            acc.push(...c.left);
          }
          return acc;
        },
        [],
      );

      return errors.length > 0
        ? Effect.fail(errors)
        : Effect.succeed(
            analyzedValueEitherItems.reduce<
              Array<AnalyzedValue<Dimension.Value> | AnalyzedValue<AliasValue>>
            >((acc, c) => {
              if (Either.isRight(c)) {
                acc.push(c.right);
              }
              return acc;
            }, []),
          );
    }),
  );
}

const parseStrokeObjectValue = makeParseObject({
  dashArray: { parser: parseStrokeStyleDashArrayValue },
  lineCap: { parser: parseStrokeStyleLineCapValue },
});

export function parseStrokeStyleRawValue(
  value: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<AnalyzedValue<StrokeStyle.RawValue>, Array<ValidationError>> {
  if (typeof value === 'string') {
    if (strokeStyleStringValues.includes(value as any)) {
      return Effect.succeed({
        raw: value as StrokeStyle.RawValue,
        toReferences: [],
      });
    }
    return Effect.fail([
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
      Effect.map((analyzed) => ({
        raw: {
          dashArray: analyzed.dashArray.map((x) => x.raw),
          lineCap: analyzed.lineCap,
        },
        toReferences: analyzed.dashArray.flatMap((x) => x.toReferences),
      })),
    );
  }
  return Effect.fail([
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
