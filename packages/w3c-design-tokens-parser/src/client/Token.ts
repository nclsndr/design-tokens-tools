import {
  DesignToken,
  type JSON,
  TokenTypeName,
} from 'design-tokens-format-module';

import { TokenState } from '../state/TokenState.js';
import { Reference } from '../state/Reference.js';
import { PickSwappedValueSignature } from '../state/ValueMapper.js';

export class Token<Type extends TokenTypeName = TokenTypeName> {
  readonly #state: TokenState;

  constructor(state: TokenState) {
    this.#state = state;
  }

  /**
   * The token path in the tree
   */
  get path(): JSON.ValuePath {
    return this.#state.path;
  }

  /**
   * The token string representation of the path
   */
  get stringPath() {
    return this.#state.stringPath;
  }

  /**
   * The token type
   */
  get type(): TokenTypeName {
    return this.#state.type;
  }

  /**
   * The token description
   */
  get description() {
    return this.#state.description;
  }

  /**
   * The token extensions
   */
  get extensions() {
    return this.#state.extensions;
  }

  /**
   * The token main data
   */
  get summary(): {
    path: JSON.ValuePath;
    type: TokenTypeName;
    description: string | undefined;
    extensions: Record<string, any> | undefined;
    references: Array<Reference>;
    rawJSONValue: DesignToken['$value'];
  } {
    return {
      path: this.#state.path,
      type: this.#state.type,
      description: this.#state.description,
      extensions: this.#state.extensions,
      references: this.#state.references.nodes,
      rawJSONValue: this.#state.getJSONValue(),
    };
  }

  /* ------------------------------------------
     Value consumption methods
  --------------------------------------------- */

  /**
   * Get the ValueMapper utility to work with the token value
   * @param options
   */
  getValueMapper(options?: {
    resolveAtDepth?: number;
  }): PickSwappedValueSignature<Type> {
    // @ts-expect-error
    return this.#state.getValueMapper(options);
  }

  /* ------------------------------------------
     JSON methods
  --------------------------------------------- */

  /**
   * Get the JSON representation of the token value
   */
  getJSONValue() {
    return this.#state.getJSONValue();
  }

  /**
   * Get the JSON representation of the token
   */
  getJSONToken() {
    return this.#state.getJSONToken();
  }

  /**
   * Get the JSON representation of the token state
   */
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
