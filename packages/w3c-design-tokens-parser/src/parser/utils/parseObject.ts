import { Effect, Either } from 'effect';
import { ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';

import type { AnalyzerContext } from './AnalyzerContext.js';
import { ValidationError } from '../../utils/validationError.js';

export function makeParseObject<
  R extends Effect.Effect<any, Array<ValidationError>>,
  P extends {
    [k: string]: {
      parser: (
        value: unknown,
        ctx: AnalyzerContext,
      ) => R extends Effect.Effect<infer Ok, any>
        ? Effect.Effect<Ok, Array<ValidationError>>
        : never;
    };
  },
>(pattern: P) {
  return function parseObject(
    candidate: unknown,
    ctx: AnalyzerContext,
  ): Effect.Effect<
    {
      [key in keyof P]: ReturnType<P[key]['parser']> extends Effect.Effect<
        infer Ok,
        any
      >
        ? Ok
        : never;
    },
    Array<ValidationError>
  > {
    if (
      typeof candidate !== 'object' ||
      candidate === null ||
      Array.isArray(candidate)
    ) {
      return Effect.fail([
        new ValidationError({
          type: 'Type',
          nodeId: ctx.nodeId,
          treePath: ctx.path,
          valuePath: ctx.valuePath,
          message: `${ctx.varName} must be an object. Got "${typeof candidate}".`,
        }),
      ]);
    }

    return Effect.all(
      Object.entries(pattern).map(([k, { parser }]) => {
        if (!(k in candidate)) {
          return Effect.fail({
            key: k,
            errors: [
              new ValidationError({
                type: 'Value',
                nodeId: ctx.nodeId,
                treePath: ctx.path,
                valuePath: ctx.valuePath,
                message: `${ctx.varName} must have a "${k}" property.`,
              }),
            ],
          });
        }

        return parser((candidate as { [key in keyof P]: any })[k], {
          ...ctx,
          varName: `${ctx.varName}${ALIAS_PATH_SEPARATOR}${k}`,
          valuePath: (ctx.valuePath ?? []).concat([k]),
        }).pipe(
          Effect.map((v) => ({ key: k, value: v })),
          Effect.mapError((err) => ({ key: k, errors: err })),
        );
      }),
      {
        concurrency: 'unbounded',
        mode: 'either',
      },
    ).pipe(
      Effect.flatMap((items) => {
        const errors = items.flatMap((item) =>
          Either.isLeft(item) ? item.left.errors : [],
        );

        if (errors.length > 0) {
          return Effect.fail(errors);
        }
        const final: {
          [key in keyof P]: ReturnType<P[key]['parser']> extends Effect.Effect<
            infer Ok,
            any
          >
            ? Ok
            : never;
        } = {} as any;

        return Effect.succeed(
          items.reduce((acc, item) => {
            if (Either.isRight(item)) {
              // @ts-expect-error - is generic and can be only indexed for reading
              acc[item.right.key] = item.right.value;
            }
            return acc;
          }, final),
        );
      }),
    );
  };
}
