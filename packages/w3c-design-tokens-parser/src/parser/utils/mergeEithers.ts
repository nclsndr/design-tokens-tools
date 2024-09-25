import { Either } from 'effect';

export function mergeEitherItems<R, L extends Array<any>, I>(
  items: Array<Either.Either<R, L>>,
  initialState: I,
  merge: (state: I, current: R) => void,
): Either.Either<I, L> {
  return items
    .reduce<[I, L]>(
      (acc, c) => {
        if (Either.isLeft(c)) {
          acc[1].push(...c.left);
        } else if (Either.isRight(c)) {
          merge(acc[0], c.right);
        }
        return acc;
      },
      [initialState, [] as any],
    )
    .reduce(
      (_, __, ___, [right, left]) =>
        // @ts-expect-error - reduce fuzzy type
        left.length > 0 ? Either.left(left) : Either.right(right),
      undefined as any,
    );
}
