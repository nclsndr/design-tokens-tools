import { Option, Result } from '@swan-io/boxed';
import {
  type JSON,
  ALIAS_PATH_SEPARATOR,
  matchIsToken,
} from 'design-tokens-format-module';

import { TokenTypeName } from 'design-tokens-format-module';
import { ValidationError } from '../../utils/validationError.js';
import { getJSONValue } from '../../utils/getJSONValue.js';
import { captureAliasPath } from '../alias/captureAliasPath.js';
import { recursivelyResolveTokenTypeFromParents } from './recursivelyResolveTokenTypeFromParents.js';
import { parseTokenTypeName } from '../../definitions/parseTokenTypeName.js';

export type ResolutionType = 'explicit' | 'alias' | 'parent';

export function recursivelyResolveTokenType(
  jsonTokenTree: JSON.Object,
  path: JSON.ValuePath,
): Result<
  {
    resolution: ResolutionType;
    resolvedType: TokenTypeName;
    paths: Array<JSON.ValuePath>;
  },
  Array<ValidationError>
> {
  const maybeToken = getJSONValue(jsonTokenTree, path);

  if (matchIsToken(maybeToken)) {
    // $type is explicitly defined
    if ('$type' in maybeToken) {
      return parseTokenTypeName(maybeToken.$type, {
        allowUndefined: false,
        varName: `${path.join(ALIAS_PATH_SEPARATOR)}.$type`,
        path: path,
        valuePath: [],
        nodeKey: '$type',
      }).map((resolvedType) => ({
        resolution: 'explicit',
        resolvedType,
        paths: [path],
      }));
    }

    return (
      // check if $value is an alias
      captureAliasPath(maybeToken.$value)
        // check whether the alias is a valid token
        .match({
          Some: (p): Option<JSON.ValuePath> => {
            if (matchIsToken(getJSONValue(jsonTokenTree, p))) {
              return Option.Some(p);
            }
            return Option.None();
          },
          None: () => Option.None(),
        })
        // recursively execute the token type resolution
        .match({
          Some: (value) => {
            try {
              return recursivelyResolveTokenType(jsonTokenTree, value).map(
                ({ resolvedType, paths }) => ({
                  resolution: 'alias' as ResolutionType,
                  resolvedType,
                  paths: paths.concat([path]),
                }),
              );
            } catch (error) {
              if (error instanceof RangeError) {
                return Result.Error([
                  new ValidationError({
                    type: 'Computation',
                    treePath: path,
                    referenceToTreePath: value,
                    message: `Circular references detected.`,
                  }),
                ]);
              }
              throw error;
            }
          },
          // Find $type in parents otherwise
          None: () =>
            recursivelyResolveTokenTypeFromParents(jsonTokenTree, path).map(
              ({ resolvedType, paths }) => ({
                resolution: 'parent' as ResolutionType,
                resolvedType,
                paths,
              }),
            ),
        })
    );
  }

  return Result.Error([
    new ValidationError({
      type: 'Value',
      treePath: path,
      valuePath: undefined,
      message: `Path "${path.join(ALIAS_PATH_SEPARATOR)}" does not resolve to a valid token.`,
    }),
  ]);
}
