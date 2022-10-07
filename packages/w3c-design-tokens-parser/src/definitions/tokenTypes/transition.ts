import { Result } from '@swan-io/boxed';

import { WithAliasValueSignature } from '../AliasSignature.js';
import { DurationValue, parseAliasableDurationValue } from './duration.js';
import {
  CubicBezierValue,
  parseAliasableCubicBezierValue,
} from './cubicBezier.js';
import { TokenSignature } from '../TokenSignature.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedValue } from '../../parser/internals/AnalyzedToken.js';
import { AnalyzerContext } from '../../parser/internals/AnalyzerContext.js';
import { makeParseObject } from '../../parser/internals/parseObject.js';
import { withAlias } from '../withAlias.js';

export type TransitionValue = WithAliasValueSignature<{
  duration: DurationValue;
  delay: DurationValue;
  timingFunction: CubicBezierValue;
}>;

export type TransitionToken = TokenSignature<'transition', TransitionValue>;

const parseTransitionRawValue = makeParseObject({
  duration: { parser: parseAliasableDurationValue },
  delay: { parser: parseAliasableDurationValue },
  timingFunction: { parser: parseAliasableCubicBezierValue },
});

export const parseAliasableTransitionValue = withAlias(
  (
    value: unknown,
    ctx: AnalyzerContext,
  ): Result<AnalyzedValue<TransitionValue>, Array<ValidationError>> => {
    return parseTransitionRawValue(value, ctx).match({
      Ok: (analyzed) => {
        return Result.Ok({
          raw: {
            duration: analyzed.duration.raw,
            delay: analyzed.delay.raw,
            timingFunction: analyzed.timingFunction.raw,
          },
          toReferences: [
            ...analyzed.duration.toReferences,
            ...analyzed.delay.toReferences,
            ...analyzed.timingFunction.toReferences,
          ],
        });
      },
      Error: (err) => {
        return Result.Error(err);
      },
    });
  },
);
