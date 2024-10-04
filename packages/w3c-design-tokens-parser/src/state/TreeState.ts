import {
  Json as JSONTypes,
  TokenTypeName,
  ALIAS_PATH_SEPARATOR,
} from 'design-tokens-format-module';
import { Option } from 'effect';

import { ReferencesSet } from './ReferencesSet.js';
import { TreeNodesMap } from './TreeNodesMap.js';
import { TokenState } from './TokenState.js';
import { GroupState } from './GroupState.js';
import { ValidationErrorsSet } from './ValidationErrorsSet.js';

function stringToRegex(input: string): RegExp {
  if (input === '*') {
    return new RegExp('.*');
  }
  return new RegExp(input);
}

export class TreeState {
  #tokens: TreeNodesMap<TokenState>;
  #groups: TreeNodesMap<GroupState>;
  #references: ReferencesSet;

  #validationErrors: ValidationErrorsSet;

  constructor() {
    this.#tokens = new TreeNodesMap();
    this.#groups = new TreeNodesMap();
    this.#references = new ReferencesSet(this);
    this.#validationErrors = new ValidationErrorsSet();
  }

  get tokenStates() {
    return this.#tokens;
  }
  get groupStates() {
    return this.#groups;
  }
  get references() {
    return this.#references;
  }
  get validationErrors() {
    return this.#validationErrors;
  }

  getTokenByPath(path: JSONTypes.ValuePath) {
    return this.#tokens.getOneByPath(path);
  }

  getTokenOfTypeByPath<T extends TokenTypeName>(
    type: T,
    path: JSONTypes.ValuePath,
  ): Option.Option<TokenState<T>> {
    // @ts-expect-error - filter can't infer the narrowed type
    return Option.filter(
      this.#tokens.getOneByPath(path),
      (tokenState) => tokenState.type === type,
    );
  }

  selectTokens(options: {
    tokenTypes?: Array<TokenTypeName>;
    where?: Array<Array<string>>;
  }) {
    return this.#tokens.nodes.reduce<Array<TokenState>>((acc, node) => {
      if (options.tokenTypes && !options.tokenTypes.includes(node.type)) {
        return acc;
      }

      const matchesWhere = !options.where
        ? true
        : options.where.some((where) => {
            const whereStringPath = where.join(ALIAS_PATH_SEPARATOR);

            // strict match
            if (whereStringPath === node.stringPath) {
              return true;
            }

            // matches a group
            if (
              Option.getOrUndefined(this.#groups.getOneByPath(whereStringPath))
            ) {
              return false;
            }

            // can match only if `where` is a subset of `node.path`
            if (where.length > node.path.length) {
              return false;
            }
            const subPath = node.path.slice(0, where.length);

            return where.every((item, i) => {
              const p = subPath[i];
              return typeof p === 'string'
                ? p.match(stringToRegex(item))
                : false;
            });
          });

      if (matchesWhere) {
        acc.push(node);
      }

      return acc;
    }, []);
  }
}
