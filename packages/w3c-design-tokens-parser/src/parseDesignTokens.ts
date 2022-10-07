import { buildTokenTree } from './state/buildTokenTree.js';
import { TreeState } from './state/TreeState.js';
import { JSONValuePath } from './definitions/JSONDefinitions.js';
import { TokenState } from './state/TokenState.js';
import { GroupState } from './state/GroupState.js';
import { DesignTokenTree, TokenTypeName } from './definitions/tokenTypes.js';
import { deepSetJSONValue } from './utils/deepSetJSONValue.js';

class Token {
  readonly #state: TokenState;
  constructor(state: TokenState) {
    this.#state = state;
  }

  get path() {
    return this.#state.path;
  }
  get stringPath() {
    return this.#state.stringPath;
  }
  get description() {
    return this.#state.description;
  }
  get extensions() {
    return this.#state.extensions;
  }

  get summary() {
    return {
      path: this.#state.path,
      type: this.#state.type,
      description: this.#state.description,
      extensions: this.#state.extensions,
      references: this.#state.computedReferences,
      rawJSONValue: this.#state.getJSONValue(),
    };
  }

  getJSONValue() {
    return this.#state.getJSONValue();
  }
  getJSONToken() {
    return this.#state.getJSONToken();
  }

  toJSON() {
    return this.#state.toJSON();
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    const rawValues = this.#state.rawValueParts.nodes;
    return `TokenState {
  path: ${JSON.stringify(this.#state.path)},
  type: "${this.#state.type}",
  rawValues: ${
    rawValues.length > 0
      ? `[
    ${rawValues.map((node) => node.toString()).join(',\n    ')}
  ]`
      : '[]'
  }
}`;
  }
}

class Group {
  readonly #state: GroupState;
  constructor(state: GroupState) {
    this.#state = state;
  }

  get path() {
    return this.#state.path;
  }
  get stringPath() {
    return this.#state.stringPath;
  }
  get description() {
    return this.#state.description;
  }
  get extensions() {
    return this.#state.extensions;
  }

  get summary() {
    return {
      path: this.#state.path,
      type: this.#state.tokenType,
      description: this.#state.description,
      extensions: this.#state.extensions,
    };
  }

  getJSONProperties() {
    return this.#state.getJSONProperties();
  }

  toJSON() {
    return this.#state.toJSON();
  }
}

class TokenTree {
  readonly #treeState: TreeState;
  constructor(treeState: TreeState) {
    this.#treeState = treeState;
  }

  getErrors() {
    return this.#treeState.validationErrors.nodes;
  }

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
  getToken(path: JSONValuePath) {
    return this.#treeState.tokenStates
      .get(path)
      .map((tokenState) => new Token(tokenState));
  }

  getAllGroups() {
    return this.#treeState.groupStates.nodes.map(
      (groupState) => new Group(groupState),
    );
  }
  getGroup(path: JSONValuePath) {
    return this.#treeState.groupStates
      .get(path)
      .map((groupState) => new Group(groupState));
  }

  toJSON() {
    const acc: DesignTokenTree = {};
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

export function parseDesignTokens(value: unknown) {
  const treeState = buildTokenTree(value);
  return new TokenTree(treeState);
}
