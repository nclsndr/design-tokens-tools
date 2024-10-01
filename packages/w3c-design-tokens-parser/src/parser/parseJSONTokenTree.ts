import { Either } from 'effect';
import {
  ALIAS_PATH_SEPARATOR,
  Json as JSONTypes,
  matchIsGroup,
  matchIsToken,
} from 'design-tokens-format-module';

import { traverseJSONValue } from '../utils/traverseJSONValue.js';
import { parseRawToken } from './token/parseRawToken.js';
import { ValidationError } from '../utils/validationError.js';
import { parseRawGroup } from './group/parseRawGroup.js';
import { AnalyzedToken } from './token/AnalyzedToken.js';
import { AnalyzedGroup } from './group/AnalyzedGroup.js';
import { makeUniqueId } from '../utils/uniqueId.js';
import { arrayEndsWith } from '../utils/arrayEndsWith.js';
import { captureAnalyzedTokensReferenceErrors } from './token/captureAnalyzedTokensReferenceErrors.js';
import { parseRawInput } from './utils/parseRawInput.js';

export const parseJSONTokenTree: (input: unknown) => Either.Either<
  {
    tokenTree: JSONTypes.Object;
    analyzedTokens: Array<AnalyzedToken>;
    analyzedGroups: Array<AnalyzedGroup>;
    tokenErrors: Array<ValidationError>;
    groupErrors: Array<ValidationError>;
  },
  ValidationError[]
> = (input) =>
  Either.flatMap(
    parseRawInput(input, {
      varName: '[root]',
      nodeId: '',
      path: [],
    }),
    (jsonTokenTree) => {
      const analyzedTokenAcc: Array<
        Either.Either<AnalyzedToken, Array<ValidationError>>
      > = [];
      const analyzedGroupAcc: Array<
        Either.Either<AnalyzedGroup, Array<ValidationError>>
      > = [];

      traverseJSONValue(jsonTokenTree, (value, rawPath) => {
        if (
          arrayEndsWith(rawPath, '$description') ||
          arrayEndsWith(rawPath, '$extensions')
        ) {
          return false;
        }

        const nodeId = makeUniqueId();

        if (matchIsToken(value)) {
          analyzedTokenAcc.push(
            parseRawToken(value, {
              jsonTokenTree,
              nodeId: nodeId,
              path: rawPath,
              varName: `${rawPath.join(ALIAS_PATH_SEPARATOR)}`,
            }),
          );

          return false;
        } else if (matchIsGroup(value)) {
          analyzedGroupAcc.push(
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

      const groupResults = analyzedGroupAcc.reduce<{
        analyzedGroups: Array<AnalyzedGroup>;
        groupErrors: Array<ValidationError>;
      }>(
        (acc, c) => {
          if (Either.isRight(c)) {
            acc.analyzedGroups.push(c.right);
          } else if (Either.isLeft(c)) {
            acc.groupErrors.push(...c.left);
          }
          return acc;
        },
        {
          analyzedGroups: [],
          groupErrors: [],
        },
      );
      const tokenResults = analyzedTokenAcc.reduce<{
        analyzedTokens: Array<AnalyzedToken>;
        tokenErrors: Array<ValidationError>;
      }>(
        (acc, c) => {
          if (Either.isRight(c)) {
            acc.analyzedTokens.push(c.right);
          } else if (Either.isLeft(c)) {
            acc.tokenErrors.push(...c.left);
          }
          return acc;
        },
        {
          analyzedTokens: [],
          tokenErrors: [],
        },
      );

      const { referenceErrors, referenceErrorsFreeAnalyzedTokens } =
        captureAnalyzedTokensReferenceErrors(tokenResults.analyzedTokens);

      return Either.right({
        tokenTree: jsonTokenTree,
        analyzedTokens: referenceErrorsFreeAnalyzedTokens,
        analyzedGroups: groupResults.analyzedGroups,
        tokenErrors: [...tokenResults.tokenErrors, ...referenceErrors],
        groupErrors: groupResults.groupErrors,
      });
    },
  );
