import { Result } from '@swan-io/boxed';
import {
  matchIsToken,
  matchIsGroup,
  ALIAS_PATH_SEPARATOR,
  JSONTokenTree,
} from 'design-tokens-format-module';

import { traverseJSONValue } from '../utils/traverseJSONValue.js';
import { parseRawToken } from './token/parseRawToken.js';
import { ValidationError } from '../utils/validationError.js';
import { parseRawGroup } from './group/parseRawGroup.js';
import { AnalyzedToken } from './token/AnalyzedToken.js';
import { AnalyzedGroup } from './group/AnalyzedGroup.js';
import { parseTreeNode } from './tree/parseTreeNode.js';
import { makeUniqueId } from '../utils/uniqueId.js';

export type AnalyzedTokenResult = Result<AnalyzedToken, Array<ValidationError>>;
export type AnalyzedGroupResult = Result<AnalyzedGroup, Array<ValidationError>>;

export function parseJSONTokenTree(root: unknown): Result<
  {
    tokenTree: JSONTokenTree;
    tokens: [Array<AnalyzedToken>, Array<ValidationError>];
    groups: [Array<AnalyzedGroup>, Array<ValidationError>];
  },
  ValidationError[]
> {
  return parseTreeNode(root, {
    varName: '[root]',
    nodeId: '',
    path: [],
  }).flatMap((jsonTokenTree) => {
    const analyzedTokens: Array<AnalyzedTokenResult> = [];
    const analyzedGroups: Array<AnalyzedGroupResult> = [];

    traverseJSONValue(jsonTokenTree, (value, rawPath) => {
      const nodeId = makeUniqueId();

      if (matchIsToken(value)) {
        analyzedTokens.push(
          parseRawToken(value, {
            jsonTokenTree,
            nodeId: nodeId,
            path: rawPath,
            varName: `${rawPath.join(ALIAS_PATH_SEPARATOR)}`,
          }),
        );

        return false;
      } else if (matchIsGroup(value)) {
        // Skip root group
        if (rawPath.length > 0) {
          analyzedGroups.push(
            parseRawGroup(value, {
              nodeId: nodeId,
              path: rawPath,
              varName: `${rawPath.join(ALIAS_PATH_SEPARATOR)}`,
            }),
          );
        }

        return true;
      }
      return false;
    });

    // Gather both valid and errored results
    return Result.Ok({
      tokenTree: jsonTokenTree as JSONTokenTree,
      tokens: analyzedTokens.reduce<
        [Array<AnalyzedToken>, Array<ValidationError>]
      >(
        (acc, res) => {
          res.isOk() ? acc[0].push(res.get()) : acc[1].push(...res.getError());
          return acc;
        },
        [[], []],
      ),
      groups: analyzedGroups.reduce<
        [Array<AnalyzedGroup>, Array<ValidationError>]
      >(
        (acc, res) => {
          res.isOk() ? acc[0].push(res.get()) : acc[1].push(...res.getError());
          return acc;
        },
        [[], []],
      ),
    });
  });
}
