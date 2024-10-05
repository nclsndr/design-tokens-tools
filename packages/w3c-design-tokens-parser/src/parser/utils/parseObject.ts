import { Either } from 'effect';
import { ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';

import type { AnalyzerContext } from './AnalyzerContext.js';
import { ValidationError } from '@nclsndr/design-tokens-utils';

export function makeParseObject<
  R extends Either.Either<any, Array<ValidationError>>,
  P extends {
    [k: string]: {
      parser: (
        value: unknown,
        ctx: AnalyzerContext,
      ) => R extends Either.Either<infer Ok, any>
        ? Either.Either<Ok, Array<ValidationError>>
        : never;
      isOptional?: boolean;
    };
  },
>(pattern: P) {
  return function parseObject(
    candidate: unknown,
    ctx: AnalyzerContext,
  ): Either.Either<
    {
      [key in keyof P]: ReturnType<P[key]['parser']> extends Either.Either<
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
      return Either.left([
        new ValidationError({
          type: 'Type',
          nodeId: ctx.nodeId,
          treePath: ctx.path,
          valuePath: ctx.valuePath,
          message: `${ctx.varName} must be an object. Got "${typeof candidate}".`,
        }),
      ]);
    }

    return Object.entries(pattern)
      .map(([k, { parser, isOptional }]) => {
        if (!(k in candidate) && !isOptional) {
          return Either.left({
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
          Either.map((v) => ({ key: k, value: v })),
          Either.mapLeft((err) => ({ key: k, errors: err })),
        );
      })
      .reduce<
        [
          {
            [key in keyof P]: ReturnType<
              P[key]['parser']
            > extends Either.Either<infer Ok, any>
              ? Ok
              : never;
          },
          Array<ValidationError>,
        ]
      >(
        (acc, c) => {
          if (Either.isLeft(c)) {
            acc[1].push(...c.left.errors);
          } else if (Either.isRight(c)) {
            // @ts-expect-error - is generic and can be only indexed for reading
            acc[0][c.right.key] = c.right.value;
          }
          return acc;
        },
        [{} as any, []],
      )
      .reduce(
        (_, __, ___, [obj, errors]) =>
          // @ts-expect-error - reduce type narrowing
          errors.length > 0 ? Either.left(errors) : Either.right(obj),
        undefined as any,
      );
  };
}
