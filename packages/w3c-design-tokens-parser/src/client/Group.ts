import { type JSON, TokenTypeName } from 'design-tokens-format-module';

import { GroupState } from '../state/GroupState.js';

export class Group {
  readonly #state: GroupState;

  constructor(state: GroupState) {
    this.#state = state;
  }

  /**
   * The group path in the tree
   */
  get path(): JSON.ValuePath {
    return this.#state.path;
  }

  /**
   * The group string representation of the path
   */
  get stringPath() {
    return this.#state.stringPath;
  }

  /**
   * The group token type
   */
  get tokenType() {
    return this.#state.tokenType;
  }

  /**
   * The group description
   */
  get description() {
    return this.#state.description;
  }

  /**
   * The group extensions
   */
  get extensions() {
    return this.#state.extensions;
  }

  /**
   * The group main data
   */
  get summary(): {
    path: JSON.ValuePath;
    type: TokenTypeName | undefined;
    description: string | undefined;
    extensions: Record<string, any> | undefined;
  } {
    return {
      path: this.#state.path,
      type: this.#state.tokenType,
      description: this.#state.description,
      extensions: this.#state.extensions,
    };
  }

  /**
   * Get the JSON properties - type, description, extensions - of the group
   */
  getJSONProperties() {
    return this.#state.getJSONProperties();
  }

  /**
   * Get the JSON representation of the group
   */
  toJSON() {
    return this.#state.toJSON();
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `Group {
  path: ${this.#state.stringPath},
  type: ${this.#state.tokenType ? `"${this.#state.tokenType}"` : `undefined`},${
    this.#state.description
      ? `  description: "${this.#state.description}",`
      : ''
  }${
    this.#state.extensions
      ? `  extensions: ${JSON.stringify(this.#state.extensions)},`
      : ''
  }
}`;
  }
}
