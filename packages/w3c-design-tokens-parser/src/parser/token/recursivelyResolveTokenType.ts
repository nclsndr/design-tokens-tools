import { Effect, Option } from 'effect';
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
): Effect.Effect<
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
        nodeId: '',
        path: path,
        valuePath: [],
        nodeKey: '$type',
      }).pipe(
        Effect.map((resolvedType) => ({
          resolution: 'explicit' as const,
          resolvedType,
          paths: [path],
        })),
      );
    }

    // check if $value is an alias
    return captureAliasPath(maybeToken.$value).pipe(
      Option.match({
        onNone: () => {
          // Not an alias, try to resolve the parent
          return Effect.map(
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
            return recursivelyResolveTokenType(jsonTokenTree, p).pipe(
              Effect.flatMap(({ resolvedType, paths }) => {
                const matched = paths
                  .map((p) => p.join(ALIAS_PATH_SEPARATOR))
                  .includes(path.join(ALIAS_PATH_SEPARATOR));

                if (matched) {
                  return Effect.fail([
                    new ValidationError({
                      type: 'Computation',
                      nodeId: '',
                      treePath: path,
                      referenceToTreePath: p,
                      message: `Circular references detected while resolving token type for token "${path.join(ALIAS_PATH_SEPARATOR)}".`,
                    }),
                  ]);
                }

                return Effect.succeed({
                  resolution: 'alias' as ResolutionType,
                  resolvedType,
                  paths: paths.concat([path]),
                });
              }),

              Effect.catchAll((errs) => {
                const hasCircularReference = errs.some(
                  (e) => e.type === 'Computation',
                );
                if (hasCircularReference) {
                  return Effect.fail(errs);
                }

                // The alias is unlinked, try to resolve the parent
                return Effect.map(
                  recursivelyResolveTokenTypeFromParents(jsonTokenTree, path),
                  ({ resolvedType, paths }) => ({
                    resolution: 'parent' as ResolutionType,
                    resolvedType,
                    paths,
                  }),
                );
              }),
            );
          } catch (error) {
            if (error instanceof RangeError) {
              return Effect.fail([
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

  return Effect.fail([
    new ValidationError({
      type: 'Value',
      nodeId: '',
      treePath: path,
      valuePath: undefined,
      message: `Path "${path.join(ALIAS_PATH_SEPARATOR)}" does not resolve to a valid token.`,
    }),
  ]);
}
