import { type JSON, TokenTypeName } from 'design-tokens-format-module';

import { GroupState } from '../state/GroupState.js';

export class Group {
  readonly #state: GroupState;

  constructor(state: GroupState) {
    this.#state = state;
  }

  get path(): JSON.ValuePath {
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

  getJSONProperties() {
    return this.#state.getJSONProperties();
  }

  toJSON() {
    return this.#state.toJSON();
  }
}
