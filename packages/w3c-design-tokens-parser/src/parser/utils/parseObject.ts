import { Result } from '@swan-io/boxed';
import { ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';

import type { AnalyzerContext } from './AnalyzerContext.js';
import { ValidationError } from '../../utils/validationError.js';

export function makeParseObject<
  R extends Result<any, Array<ValidationError>>,
  P extends {
    [k: string]: {
      parser: (
        value: unknown,
        ctx: AnalyzerContext,
      ) => R extends Result<infer Ok, any>
        ? Result<Ok, Array<ValidationError>>
        : never;
    };
  },
>(pattern: P) {
  return function parseObject(
    candidate: unknown,
    ctx: AnalyzerContext,
  ): Result<
    {
      [key in keyof P]: ReturnType<P[key]['parser']> extends Result<
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
      return Result.Error([
        new ValidationError({
          type: 'Type',
          nodeId: ctx.nodeId,
          treePath: ctx.path,
          valuePath: ctx.valuePath,
          message: `${ctx.varName} must be an object. Got "${typeof candidate}".`,
        }),
      ]);
    }

    const errors: Array<ValidationError> = [];
    const final: {
      [key in keyof P]: ReturnType<P[key]['parser']> extends Result<
        infer Ok,
        any
      >
        ? Ok
        : never;
    } = {} as any;

    for (const [k, { parser }] of Object.entries(pattern)) {
      if (!(k in candidate)) {
        errors.push(
          new ValidationError({
            type: 'Value',
            nodeId: ctx.nodeId,
            treePath: ctx.path,
            valuePath: ctx.valuePath,
            message: `${ctx.varName} must have a "${k}" property.`,
          }),
        );
        continue;
      }

      parser((candidate as { [key in keyof P]: any })[k], {
        ...ctx,
        varName: `${ctx.varName}${ALIAS_PATH_SEPARATOR}${k}`,
        valuePath: (ctx.valuePath ?? []).concat([k]),
      }).match({
        Ok: (parsed) => {
          final[k as keyof P] = parsed;
        },
        Error: (error) => {
          errors.push(...error);
        },
      });
    }

    if (errors.length) {
      return Result.Error(errors);
    }
    return Result.Ok(final);
  };
}
