import { ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';
import { Option, Array as EArray } from 'effect';
import { stringToRegex } from '../../utils/stringToRegex.js';
import { TokenState } from '../TokenState.js';
import { SelectToken } from '../../library/internals/Select.js';

export function matchTokenStateAgainstSelectToken(
  tokenState: TokenState,
  select: SelectToken,
): boolean {
  if (select.tokenTypes && !select.tokenTypes.includes(tokenState.type)) {
    return false;
  }

  return !select.where
    ? true
    : select.where.some((where) => {
        const whereStringPath = where.join(ALIAS_PATH_SEPARATOR);

        // strict match
        if (whereStringPath === tokenState.stringPath) {
          return true;
        }

        // matches a group
        if (
          Option.getOrUndefined(
            tokenState.treeState.groupStates.getOneByPath(whereStringPath),
          )
        ) {
          return false;
        }

        const tokenPath = tokenState.path;

        // can match only if `where` is a subset of `tokenPath`
        if (where.length > tokenPath.length) {
          return false;
        }

        // match any descendant
        const maybeLast = Option.getOrUndefined(EArray.last(where));
        if (maybeLast === '**') {
          const subWhere = where.slice(0, -1);
          const subPath = tokenPath.slice(0, subWhere.length);
          return subWhere.every((item, i) => {
            const p = subPath[i];
            return typeof p === 'string' ? p.match(stringToRegex(item)) : false;
          });
        }

        // can match only if `where` has the same length as `tokenPath`
        if (where.length !== tokenPath.length) {
          return false;
        }
        return where.every((item, i) => {
          const p = tokenPath[i] ?? '';
          return typeof p === 'string' ? p.match(stringToRegex(item)) : false;
        });
      });
}
