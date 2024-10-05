import { Either } from 'effect';
import {
  ALIAS_PATH_SEPARATOR,
  JSONTokenTree,
  matchIsGroup,
  matchIsToken,
  TokenTypeName,
} from 'design-tokens-format-module';

import { arrayEndsWith } from '../generic/arrayEndsWith.js';
import { traverseJSONValue } from '../json/traverseJSONValue.js';
import { getJSONValue } from '../json/getJSONValue.js';
import { deepSetJSONValue } from '../json/deepSetJSONValue.js';

export function mergeJSONTrees(
  source: JSONTokenTree,
  ...targets: Array<JSONTokenTree>
): Either.Either<JSONTokenTree, string> {
  try {
    const acc = globalThis.structuredClone(source);

    for (const target of targets) {
      traverseJSONValue(target, (value, path) => {
        if (
          arrayEndsWith(path, '$description') ||
          arrayEndsWith(path, '$extensions')
        ) {
          return false;
        }

        if (matchIsToken(value)) {
          const hasValue = getJSONValue(acc, path);

          if (hasValue) {
            throw new Error(
              `Token with path "${path.join(ALIAS_PATH_SEPARATOR)}" already exists in source.`,
            );
          }

          deepSetJSONValue(acc, path, globalThis.structuredClone(value));
          return false;
        } else if (matchIsGroup(value)) {
          const { $type, $description, $extensions } = value;

          if (path.length === 0) {
            if ($type || $description || $extensions) {
              throw new Error(
                `Target root group cannot have $type, $description or $extensions.`,
              );
            }

            return true;
          }

          const initialState = getJSONValue(acc, path);
          const target =
            typeof initialState === 'object' &&
            initialState !== null &&
            !Array.isArray(initialState)
              ? (initialState as Record<string, any>)
              : undefined;

          if (target) {
            if ('$description' in target || $description !== undefined) {
              throw new Error(
                `Group with path "${path.join(ALIAS_PATH_SEPARATOR)}" already defines the $description property.`,
              );
            }
            if ('$extensions' in target || $extensions !== undefined) {
              throw new Error(
                `Group with path "${path.join(ALIAS_PATH_SEPARATOR)}" already defines the $extensions property.`,
              );
            }

            const targetType =
              '$type' in target ? (target.$type as TokenTypeName) : undefined;

            if (
              targetType !== undefined &&
              $type !== undefined &&
              targetType !== $type
            ) {
              throw new Error(
                `Group with path "${path.join(ALIAS_PATH_SEPARATOR)}" already exists in source while conflicting with the target type "${$type}".`,
              );
            }
          }

          const localAcc = (initialState as any) ?? {};
          if ($type !== undefined) {
            localAcc.$type = $type;
          }
          if ($description !== undefined) {
            localAcc.$description = $description;
          }
          if ($extensions !== undefined) {
            localAcc.$extensions = $extensions;
          }

          deepSetJSONValue(acc, path, localAcc);
          return true;
        }
        return false;
      });
    }

    return Either.right(acc);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'mergeJSONTrees failed to merge trees';
    return Either.left(message);
  }
}
