import { Result } from '@swan-io/boxed';

import { traverseJSONValue } from '../utils/traverseJSONValue.js';
import { matchIsTokenSignature } from '../definitions/TokenSignature.js';
import { matchIsGroupSignature } from '../definitions/GroupSignature.js';
import { parseRawToken } from './token/parseRawToken.js';
import { ValidationError } from '../utils/validationError.js';
import { parseGroup } from './group/parseGroup.js';
import { AnalyzedToken } from './internals/AnalyzedToken.js';
import { AnalyzedGroup } from './internals/AnalyzedGroup.js';
import { ALIAS_PATH_SEPARATOR } from '../definitions/AliasSignature.js';
import { parseTreeNode } from './tree/parseTreeNode.js';

export type AnalyzedTokenResult = Result<AnalyzedToken, Array<ValidationError>>;
export type AnalyzedGroupResult = Result<AnalyzedGroup, Array<ValidationError>>;

export function parseJSONTokenTree(root: unknown) {
  return parseTreeNode(root, {
    varName: '[root]',
    path: [],
  }).flatMap((jsonTokenTree) => {
    const analyzedTokens: Array<AnalyzedTokenResult> = [];
    const analyzedGroups: Array<AnalyzedGroupResult> = [];

    traverseJSONValue(jsonTokenTree, (value, rawPath) => {
      if (matchIsTokenSignature(value)) {
        analyzedTokens.push(
          parseRawToken(value, {
            jsonTokenTree,
            varName: `${rawPath.join(ALIAS_PATH_SEPARATOR)}`,
            path: rawPath,
          }),
        );

        return false;
      } else if (matchIsGroupSignature(value)) {
        analyzedGroups.push(
          parseGroup(value, {
            path: rawPath,
            varName: `${rawPath.join(ALIAS_PATH_SEPARATOR)}`,
          }),
        );

        return true;
      }
      return false;
    });

    // Gather both valid and errored results
    return Result.Ok({
      tokenTree: jsonTokenTree,
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
