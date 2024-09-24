import { Cause, Effect, Exit } from 'effect';
import {
  matchIsToken,
  matchIsGroup,
  ALIAS_PATH_SEPARATOR,
  JSON as JSONTypes,
} from 'design-tokens-format-module';

import { traverseJSONValue } from '../utils/traverseJSONValue.js';
import { parseRawToken } from './token/parseRawToken.js';
import { ValidationError } from '../utils/validationError.js';
import { parseRawGroup } from './group/parseRawGroup.js';
import { AnalyzedToken } from './token/AnalyzedToken.js';
import { AnalyzedGroup } from './group/AnalyzedGroup.js';
import { parseTreeNode } from './tree/parseTreeNode.js';
import { makeUniqueId } from '../utils/uniqueId.js';
import { AnalyzerContext } from './utils/AnalyzerContext.js';

function endsWith(arr: Array<string | number>, end: string | number): boolean {
  if (arr.length === 0) return false;
  return arr[arr.length - 1] === end;
}

function parseRawInput(
  input: unknown,
  ctx: AnalyzerContext,
): Effect.Effect<JSONTypes.Object, Array<ValidationError>, never> {
  if (typeof input === 'string') {
    return Effect.try({
      try: () => JSON.parse(input) as JSONTypes.Object,
      catch: () => {
        return [
          new ValidationError({
            nodeId: '',
            type: 'Computation',
            message: 'Failed to parse JSON string',
            treePath: [],
          }),
        ];
      },
    });
  }
  return parseTreeNode(input, ctx);
}

export const parseJSONTokenTree: (input: unknown) => Effect.Effect<
  {
    tokenTree: JSONTypes.Object;
    analyzedTokens: Array<AnalyzedToken>;
    analyzedGroups: Array<AnalyzedGroup>;
    tokenErrors: Array<ValidationError>;
    groupErrors: Array<ValidationError>;
  },
  ValidationError[],
  never
> = (input) =>
  parseRawInput(input, {
    varName: '[root]',
    nodeId: '',
    path: [],
  }).pipe(
    Effect.flatMap((jsonTokenTree) => {
      const analyzedTokenEffects: Array<
        Effect.Effect<AnalyzedToken, Array<ValidationError>>
      > = [];
      const analyzedGroupEffects: Array<
        Effect.Effect<AnalyzedGroup, Array<ValidationError>>
      > = [];

      traverseJSONValue(jsonTokenTree, (value, rawPath) => {
        if (
          endsWith(rawPath, '$description') ||
          endsWith(rawPath, '$extensions')
        ) {
          return false;
        }

        const nodeId = makeUniqueId();

        if (matchIsToken(value)) {
          analyzedTokenEffects.push(
            parseRawToken(value, {
              jsonTokenTree,
              nodeId: nodeId,
              path: rawPath,
              varName: `${rawPath.join(ALIAS_PATH_SEPARATOR)}`,
            }),
          );

          return false;
        } else if (matchIsGroup(value)) {
          analyzedGroupEffects.push(
            parseRawGroup(value, {
              nodeId: nodeId,
              path: rawPath,
              varName: `${rawPath.join(ALIAS_PATH_SEPARATOR)}`,
            }),
          );

          return true;
        }
        return false;
      });

      const tokenErrors: Array<ValidationError> = [];
      const analyzedTokens: Array<AnalyzedToken> = [];
      for (const tokenEffect of analyzedTokenEffects) {
        Exit.match(Effect.runSyncExit(tokenEffect), {
          onSuccess: (value) => {
            analyzedTokens.push(value);
          },
          onFailure: (cause) => {
            Cause.match(cause, {
              onEmpty: undefined,
              onFail: (errors) => {
                tokenErrors.push(...errors);
              },
              onDie: () => {},
              onInterrupt: () => {},
              onSequential: () => {},
              onParallel: () => {},
            });
          },
        });
      }

      const groupErrors: Array<ValidationError> = [];
      const analyzedGroups: Array<AnalyzedGroup> = [];

      for (const groupEffect of analyzedGroupEffects) {
        Exit.match(Effect.runSyncExit(groupEffect), {
          onSuccess: (value) => {
            analyzedGroups.push(value);
          },
          onFailure: (cause) => {
            Cause.match(cause, {
              onEmpty: undefined,
              onFail: (errors) => {
                groupErrors.push(...errors);
              },
              onDie: () => {},
              onInterrupt: () => {},
              onSequential: () => {},
              onParallel: () => {},
            });
          },
        });
      }

      return Effect.succeed({
        tokenTree: jsonTokenTree,
        analyzedTokens,
        analyzedGroups,
        tokenErrors,
        groupErrors,
      });
    }),
  );
