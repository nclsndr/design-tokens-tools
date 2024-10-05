import { Either, Option } from 'effect';
import {
  type Json,
  ALIAS_PATH_SEPARATOR,
  matchIsToken,
} from 'design-tokens-format-module';
import { getJSONValue } from '@nclsndr/design-tokens-utils';

import { TokenTypeName } from 'design-tokens-format-module';
import { ValidationError } from '@nclsndr/design-tokens-utils';
import { captureAliasPath } from '../alias/captureAliasPath.js';
import { recursivelyResolveTokenTypeFromParents } from './recursivelyResolveTokenTypeFromParents.js';
import { parseTokenTypeName } from './parseTokenTypeName.js';

export type ResolutionType = 'explicit' | 'alias' | 'parent';

export function recursivelyResolveTokenType(
  jsonTokenTree: Json.Object,
  path: Json.ValuePath,
): Either.Either<
  {
    resolution: ResolutionType;
    resolvedType: TokenTypeName;
    paths: Array<Json.ValuePath>;
  },
  Array<ValidationError>
> {
  const maybeToken = getJSONValue(jsonTokenTree, path);

  if (matchIsToken(maybeToken)) {
    // $type is explicitly defined
    if ('$type' in maybeToken) {
      return Either.map(
        parseTokenTypeName(maybeToken.$type, {
          allowUndefined: false,
          varName: `${path.join(ALIAS_PATH_SEPARATOR)}.$type`,
          nodeId: '',
          path: path,
          valuePath: [],
          nodeKey: '$type',
        }),
        (resolvedType) => ({
          resolution: 'explicit' as const,
          resolvedType,
          paths: [path],
        }),
      );
    }

    // check if $value is an alias
    return captureAliasPath(maybeToken.$value).pipe(
      Option.match({
        onNone: () => {
          // Not an alias, try to resolve the parent
          return Either.map(
            recursivelyResolveTokenTypeFromParents(jsonTokenTree, path),
            ({ resolvedType, paths }) => ({
              resolution: 'parent' as ResolutionType,
              resolvedType,
              paths,
            }),
          );
        },
        onSome: (p) => {
          try {
            return Either.match(recursivelyResolveTokenType(jsonTokenTree, p), {
              onRight: ({ resolvedType, paths }) => {
                const matched = paths
                  .map((p) => p.join(ALIAS_PATH_SEPARATOR))
                  .includes(path.join(ALIAS_PATH_SEPARATOR));

                if (matched) {
                  return Either.left([
                    new ValidationError({
                      type: 'Computation',
                      nodeId: '',
                      treePath: path,
                      referenceToTreePath: p,
                      message: `Circular references detected while resolving token type for token "${path.join(ALIAS_PATH_SEPARATOR)}".`,
                    }),
                  ]);
                }

                return Either.right({
                  resolution: 'alias' as ResolutionType,
                  resolvedType,
                  paths: paths.concat([path]),
                });
              },
              onLeft: (errs) => {
                const hasCircularReference = errs.some(
                  (e) => e.type === 'Computation',
                );
                if (hasCircularReference) {
                  return Either.left(errs);
                }

                // The alias is unlinked, try to resolve the parent
                return Either.map(
                  recursivelyResolveTokenTypeFromParents(jsonTokenTree, path),
                  ({ resolvedType, paths }) => ({
                    resolution: 'parent' as ResolutionType,
                    resolvedType,
                    paths,
                  }),
                );
              },
            });
          } catch (error) {
            if (error instanceof RangeError) {
              return Either.left([
                new ValidationError({
                  type: 'Computation',
                  nodeId: '',
                  treePath: path,
                  referenceToTreePath: p,
                  message: `Circular references detected while resolving token type for token "${path.join(ALIAS_PATH_SEPARATOR)}".`,
                }),
              ]);
            }
            throw error;
          }
        },
      }),
    );
  }

  return Either.left([
    new ValidationError({
      type: 'Value',
      nodeId: '',
      treePath: path,
      valuePath: undefined,
      message: `Path "${path.join(ALIAS_PATH_SEPARATOR)}" does not resolve to a valid token.`,
    }),
  ]);
}
