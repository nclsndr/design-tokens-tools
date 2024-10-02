import { Either } from 'effect';
import { type Json } from 'design-tokens-format-module';

type TokenTypeMapping = {
  _tokenType: string;
};
function matchIsTokenTypeMapping(data: unknown): data is TokenTypeMapping {
  if (typeof data !== 'object' || data === null || Array.isArray(data))
    return false;
  return `_tokenType` in data;
}
type ConstantMapping = {
  _constant: string | number | boolean | bigint | null;
};
function matchIsConstantMapping(data: unknown): data is ConstantMapping {
  if (typeof data !== 'object' || data === null || Array.isArray(data))
    return false;
  return `_constant` in data;
}
type PrimitiveMapping = {
  _primitive: string; // typeof data === _primitive
};
function matchIsPrimitiveMapping(data: unknown): data is PrimitiveMapping {
  if (typeof data !== 'object' || data === null || Array.isArray(data))
    return false;
  return `_primitive` in data;
}
type UnionMapping = {
  _unionOf: Array<TokenTypesMapping>;
};
function matchIsUnionMapping(data: unknown): data is UnionMapping {
  if (typeof data !== 'object' || data === null || Array.isArray(data))
    return false;
  return `_unionOf` in data;
}
type MapOfMapping = {
  _mapOf: { [key: string]: TokenTypesMapping };
};
function matchIsMapOfMapping(data: unknown): data is MapOfMapping {
  if (typeof data !== 'object' || data === null || Array.isArray(data))
    return false;
  return `_mapOf` in data;
}
type ArrayOfMapping = {
  _arrayOf: TokenTypesMapping;
};
function matchIsArrayOfMapping(data: unknown): data is ArrayOfMapping {
  if (typeof data !== 'object' || data === null || Array.isArray(data))
    return false;
  return `_arrayOf` in data;
}
type TupleMapping = {
  _tuple: Array<TokenTypesMapping>;
};
function matchIsTupleMapping(data: unknown): data is TupleMapping {
  if (typeof data !== 'object' || data === null || Array.isArray(data))
    return false;
  return `_tuple` in data;
}

export type TokenTypesMapping =
  | TokenTypeMapping
  | PrimitiveMapping
  | ConstantMapping
  | UnionMapping
  | MapOfMapping
  | ArrayOfMapping
  | TupleMapping;

function formatMappingToString(mapping: TokenTypesMapping): string {
  if (matchIsTokenTypeMapping(mapping)) {
    return `Token(${mapping._tokenType})`;
  }
  if (matchIsUnionMapping(mapping)) {
    return mapping._unionOf.map(formatMappingToString).join(' | ');
  }
  if (matchIsMapOfMapping(mapping)) {
    return `{
  ${Object.entries(mapping._mapOf)
    .map(([key, value]) => `${key}: ${formatMappingToString(value)}`)
    .join(',\n  ')}
}`;
  }
  if (matchIsArrayOfMapping(mapping)) {
    return `Array<${formatMappingToString(mapping._arrayOf)}>`;
  }
  if (matchIsPrimitiveMapping(mapping)) {
    return `typeof === '${mapping._primitive}'`;
  }
  if (matchIsConstantMapping(mapping)) {
    return `const(${JSON.stringify(mapping._constant)}: ${typeof mapping._constant})`;
  }

  return JSON.stringify(mapping);
}

export type MatchTokenTypeAgainstMappingResult = Either.Either<
  true,
  { expectedType: string }
>;
export function matchTypeAgainstMapping(
  input: unknown,
  mapping: TokenTypesMapping,
  treePath: Json.ValuePath,
  valuePath: Json.ValuePath,
  getDiscriminatorValue: (
    discriminatorKeyPath: Json.ValuePath,
  ) => string | undefined = () => undefined,
  initialMapping: TokenTypesMapping = mapping,
): MatchTokenTypeAgainstMappingResult {
  const [selector, ...tail] = valuePath;

  if (matchIsTokenTypeMapping(mapping)) {
    return mapping._tokenType === input
      ? Either.right(true)
      : Either.left({
          expectedType:
            valuePath.length === 0 ? formatMappingToString(mapping) : '',
        });
  }
  if (matchIsPrimitiveMapping(mapping)) {
    return mapping._primitive === typeof input
      ? Either.right(true)
      : Either.left({
          expectedType:
            valuePath.length === 0 ? formatMappingToString(mapping) : '',
        });
  }
  if (matchIsConstantMapping(mapping)) {
    return mapping._constant === input
      ? Either.right(true)
      : Either.left({
          expectedType:
            valuePath.length === 0 ? formatMappingToString(mapping) : '',
        });
  }
  if (matchIsUnionMapping(mapping)) {
    const res = mapping._unionOf.map((m) =>
      matchTypeAgainstMapping(
        input,
        m,
        treePath,
        valuePath,
        getDiscriminatorValue,
        initialMapping,
      ),
    );

    const hasOk = res.some((r) => Either.isRight(r));
    return hasOk
      ? Either.right(true)
      : res.reduce(
          (acc, r) =>
            Either.match(r, {
              onRight: (_) => {
                throw new Error(
                  'DESIGN ERROR :: Unexpected Ok in UnionMapping',
                );
              },
              onLeft: (err) =>
                Either.isLeft(acc)
                  ? Either.mapLeft(acc, (e) => ({
                      expectedType: [e.expectedType, err.expectedType]
                        .filter((m) => m.length > 0)
                        .join(' | '),
                    }))
                  : Either.left(err),
            }),
          Either.right(true),
        );
  }
  if (matchIsMapOfMapping(mapping)) {
    const nextMapping = mapping._mapOf[selector];
    if (!nextMapping) {
      return Either.left({
        expectedType: `key: ${Object.keys(mapping._mapOf)
          .map((x) => JSON.stringify(x))
          .join(', ')} - got: ${JSON.stringify(selector)}`,
      });
    }
    return matchTypeAgainstMapping(
      input,
      nextMapping,
      treePath,
      tail,
      getDiscriminatorValue,
      initialMapping,
    );
  }
  if (matchIsArrayOfMapping(mapping)) {
    return matchTypeAgainstMapping(
      input,
      mapping._arrayOf,
      treePath,
      tail,
      getDiscriminatorValue,
      initialMapping,
    );
  }
  if (matchIsTupleMapping(mapping)) {
    const nextMapping =
      typeof selector === 'number' ? mapping._tuple[selector] : false;

    if (!nextMapping) {
      return Either.left({
        expectedType: `index: ${mapping._tuple
          .map((_, i) => i)
          .join(', ')} - got: ${JSON.stringify(selector)}`,
      });
    }

    return matchTypeAgainstMapping(
      input,
      nextMapping,
      treePath,
      tail,
      getDiscriminatorValue,
      initialMapping,
    );
  }

  throw new Error(
    `DESIGN ERROR :: Unknown mapping type: ${JSON.stringify(mapping)}`,
  );
}
