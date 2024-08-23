import { Result } from '@swan-io/boxed';
import { type JSON } from 'design-tokens-format-module';

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

export type MatchTokenTypeAgainstMappingResult = Result<
  true,
  { expectedType: string }
>;
export function matchTypeAgainstMapping(
  input: unknown,
  mapping: TokenTypesMapping,
  treePath: JSON.ValuePath,
  valuePath: JSON.ValuePath,
  getDiscriminatorValue: (
    discriminatorKeyPath: JSON.ValuePath,
  ) => string | undefined = () => undefined,
  initialMapping: TokenTypesMapping = mapping,
): MatchTokenTypeAgainstMappingResult {
  const [selector, ...tail] = valuePath;

  if (matchIsTokenTypeMapping(mapping)) {
    return mapping._tokenType === input
      ? Result.Ok(true)
      : Result.Error({
          expectedType:
            valuePath.length === 0 ? formatMappingToString(mapping) : '',
        });
  }
  if (matchIsPrimitiveMapping(mapping)) {
    return mapping._primitive === typeof input
      ? Result.Ok(true)
      : Result.Error({
          expectedType:
            valuePath.length === 0 ? formatMappingToString(mapping) : '',
        });
  }
  if (matchIsConstantMapping(mapping)) {
    return mapping._constant === input
      ? Result.Ok(true)
      : Result.Error({
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

    const hasOk = res.some((r) => r.isOk());
    return hasOk
      ? Result.Ok(true)
      : res.reduce((acc, r) => {
          return r.match({
            Ok: (_) => {
              throw new Error('DESIGN ERROR :: Unexpected Ok in UnionMapping');
            },
            Error: (err) => {
              return acc.isError()
                ? acc.mapError((e) => ({
                    expectedType: [e.expectedType, err.expectedType]
                      .filter((m) => m.length > 0)
                      .join(' | '),
                  }))
                : Result.Error(err);
            },
          });
        }, Result.Ok(true));
  }
  if (matchIsMapOfMapping(mapping)) {
    const nextMapping = mapping._mapOf[selector];
    if (!nextMapping) {
      return Result.Error({
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
      return Result.Error({
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
