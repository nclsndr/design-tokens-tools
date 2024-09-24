import {
  type JSON,
  JSONTokenTree,
  TokenTypeName,
} from 'design-tokens-format-module';
import { Option } from 'effect';

import { TreeState } from '../state/TreeState.js';
import { Token } from './Token.js';
import { Group } from './Group.js';
import { deepSetJSONValue } from '../utils/deepSetJSONValue.js';

export class TokenTree {
  readonly #treeState: TreeState;

  constructor(treeState: TreeState) {
    this.#treeState = treeState;
  }

  /**
   * Get a glimpse of the token tree state
   */
  get summary() {
    return {
      tokens: this.#treeState.tokenStates.size,
      groups: this.#treeState.groupStates.size,
      references: this.#treeState.references.size,
      validationErrors: this.#treeState.validationErrors.size,
    };
  }

  /**
   * Get parsing and validation errors
   */
  getErrors() {
    return this.#treeState.validationErrors.nodes;
  }

  /* ------------------------------------------
   Token methods
  --------------------------------------------- */

  /**
   * Get all tokens in the tree
   */
  getAllTokens() {
    return this.#treeState.tokenStates.map(
      (tokenState) => new Token(tokenState),
    );
  }

  /**
   * Get all tokens of a specific type
   */
  getAllTokensByType(type: TokenTypeName) {
    return this.#treeState.tokenStates.nodes
      .filter((tokenState) => tokenState.type === type)
      .map((tokenState) => new Token(tokenState));
  }

  /**
   * Get a token by its path
   * @param path
   */
  getToken(path: JSON.ValuePath) {
    return Option.match(this.#treeState.tokenStates.getOneByPath(path), {
      onSome: (tokenState) => new Token(tokenState),
      onNone: () => undefined,
    });
  }

  /**
   * Get a token of a specific type by its path
   * @param type
   * @param path
   */
  getTokenOfType<T extends TokenTypeName>(type: T, path: JSON.ValuePath) {
    return this.#treeState.tokenStates.getOneByPath(path).pipe(
      Option.filter((tokenState) => tokenState.type === type),
      Option.match({
        onSome: (tokenState) => new Token(tokenState),
        onNone: () => undefined,
      }),
    );
  }

  /**
   * Map over all tokens of a specific type
   */
  mapTokensByType<T extends TokenTypeName, R>(
    type: T,
    callback: (token: Token<T>) => R,
  ) {
    return this.#treeState.tokenStates.nodes
      .filter((tokenState) => tokenState.type === type)
      .map((tokenState) => callback(new Token(tokenState)));
  }

  /* ------------------------------------------
     Group methods
  --------------------------------------------- */

  /**
   * Get all groups in the tree
   */
  getAllGroups() {
    return this.#treeState.groupStates.map(
      (groupState) => new Group(groupState),
    );
  }

  /**
   * Get a group by its path
   * @param path
   */
  getGroup(path: JSON.ValuePath) {
    return Option.match(this.#treeState.groupStates.getOneByPath(path), {
      onSome: (groupState) => new Group(groupState),
      onNone: () => undefined,
    });
  }

  /* ------------------------------------------
     Misc
  --------------------------------------------- */

  /**
   * Get the JSON representation of the token tree
   */
  toJSON() {
    const acc: JSONTokenTree = {};
    for (const group of this.#treeState.groupStates.nodes) {
      if (group.path.length === 0) {
        Object.entries(group.getJSONProperties()).forEach(([key, value]) => {
          (acc as any)[key] = value;
        });
        continue;
      }
      deepSetJSONValue(acc, group.path, group.toJSON());
    }
    for (const token of this.#treeState.tokenStates.nodes) {
      deepSetJSONValue(acc, token.path, token.toJSON());
    }
    return acc;
  }
}
