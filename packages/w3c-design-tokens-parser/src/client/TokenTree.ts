import {
  type JSON,
  JSONTokenTree,
  TokenTypeName,
} from 'design-tokens-format-module';

import { TreeState } from '../state/TreeState.js';
import { Token } from './Token.js';
import { Group } from './Group.js';
import { deepSetJSONValue } from '../utils/deepSetJSONValue.js';

export class TokenTree {
  readonly #treeState: TreeState;

  constructor(treeState: TreeState) {
    this.#treeState = treeState;
  }

  getErrors() {
    return this.#treeState.validationErrors.nodes;
  }

  /* ------------------------------------------
     Token methods
  --------------------------------------------- */

  getAllTokens() {
    return this.#treeState.tokenStates.nodes.map(
      (tokenState) => new Token(tokenState),
    );
  }

  getAllTokensByType(type: TokenTypeName) {
    return this.#treeState.tokenStates.nodes
      .filter((tokenState) => tokenState.type === type)
      .map((tokenState) => new Token(tokenState));
  }

  getToken(path: JSON.ValuePath) {
    return this.#treeState.tokenStates
      .get(path)
      .map((tokenState) => new Token(tokenState));
  }

  mapTokens<T>(callback: (token: Token) => T) {
    return this.#treeState.tokenStates.nodes.map((tokenState) =>
      callback(new Token(tokenState)),
    );
  }

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

  getAllGroups() {
    return this.#treeState.groupStates.nodes.map(
      (groupState) => new Group(groupState),
    );
  }

  getGroup(path: JSON.ValuePath) {
    return this.#treeState.groupStates
      .get(path)
      .map((groupState) => new Group(groupState));
  }

  mapGroups<T>(callback: (group: Group) => T) {
    return this.#treeState.groupStates.nodes.map((groupState) =>
      callback(new Group(groupState)),
    );
  }

  /* ------------------------------------------
     Misc
  --------------------------------------------- */

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
