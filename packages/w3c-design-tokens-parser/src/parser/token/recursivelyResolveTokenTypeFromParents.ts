import { Either } from 'effect';
import {
  TokenTypeName,
  type JSON,
  tokenTypeNames,
  matchIsTokenTypeName,
  ALIAS_PATH_SEPARATOR,
} from 'design-tokens-format-module';

import { ValidationError } from '../../utils/validationError.js';
import { getJSONValue } from '../../utils/getJSONValue.js';

export function recursivelyResolveTokenTypeFromParents(
  tokenTree: JSON.Object,
  path: JSON.ValuePath,
  originalPath: JSON.ValuePath = path,
): Either.Either<
  {
    resolvedType: TokenTypeName;
    paths: Array<JSON.ValuePath>;
  },
  Array<ValidationError>
> {
  const result = getJSONValue(tokenTree, path);
  if (typeof result !== 'object') {
    return Either.left([
      new ValidationError({
        type: 'Value',
        nodeId: '',
        treePath: originalPath,
        valuePath: undefined,
        message: `Could not resolve $type for token at path: "${originalPath.join(ALIAS_PATH_SEPARATOR)}".`,
      }),
    ]);
  } else if (result && typeof result === 'object' && '$type' in result) {
    if (matchIsTokenTypeName(result.$type)) {
      return Either.right({
        resolvedType: result.$type,
        paths: [path],
      });
    } else {
      const message =
        path.length === originalPath.length
          ? `Invalid $type "${result.$type}" at path: "${originalPath.join(ALIAS_PATH_SEPARATOR)}". Value must be one of: ${tokenTypeNames.map((x) => `"${x}"`).join(', ')}.`
          : path.length > 0
            ? `Invalid $type "${result.$type}" for path: "${originalPath.join(ALIAS_PATH_SEPARATOR)}" while being resolved from "${path.join(ALIAS_PATH_SEPARATOR)}".`
            : `Invalid $type "${result.$type}" for path: "${originalPath.join(ALIAS_PATH_SEPARATOR)}" while being resolved from root.`;

      return Either.left([
        new ValidationError({
          type: 'Value',
          nodeId: '',
          treePath: originalPath,
          valuePath: undefined,
          message,
        }),
      ]);
    }
  }

  const nextParentPath = path.slice(0, -1);
  if (path.length === 0 && nextParentPath.length === 0) {
    return Either.left([
      new ValidationError({
        type: 'Value',
        nodeId: '',
        treePath: originalPath,
        valuePath: undefined,
        message: `Could not resolve $type from token up to root.`,
      }),
    ]);
  }
  return recursivelyResolveTokenTypeFromParents(
    tokenTree,
    nextParentPath,
    originalPath,
  ).pipe(
    Either.map(({ resolvedType, paths }) => ({
      resolvedType,
      paths: paths.concat([path]),
    })),
  );
}
