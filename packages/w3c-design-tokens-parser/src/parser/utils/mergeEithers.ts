import { Either } from 'effect';

export function mergeEitherItems<R, L extends Array<any>, I>(
  items: Array<Either.Either<R, L>>,
  initialState: I,
  merge: (state: I, current: R) => void,
): Either.Either<I, L> {
  const [right, left] = items.reduce<[I, L]>(
    (acc, c) => {
      if (Either.isLeft(c)) {
        acc[1].push(...c.left);
      } else if (Either.isRight(c)) {
        merge(acc[0], c.right);
      }
      return acc;
    },
    [initialState, [] as any],
  );

  return left.length > 0 ? Either.left(left) : Either.right(right);
}
