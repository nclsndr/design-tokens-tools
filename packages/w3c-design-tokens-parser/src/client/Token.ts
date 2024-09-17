import {
  DesignToken,
  type JSON,
  type TokenTypeName,
  type PickTokenByType,
} from 'design-tokens-format-module';

import { TokenState } from '../state/TokenState.js';
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

  get name() {
    return this.#state.name;
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
    references: Array<{
      fromTreePath: string;
      fromValuePath: string;
      toTreePath: string;
      isFullyLinked: boolean;
      isShallowlyLinked: boolean;
    }>;
    rawJSONValue: DesignToken['$value'];
  } {
    return {
      path: this.#state.path,
      type: this.#state.type,
      description: this.#state.description,
      extensions: this.#state.extensions,
      references: this.#state.referencesArray.map((r) => ({
        fromTreePath: r.fromTreePath.string,
        fromValuePath: r.fromValuePath.string,
        toTreePath: r.toTreePath.string,
        isFullyLinked: r.isFullyLinked,
        isShallowlyLinked: r.isShallowlyLinked,
      })),
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
  getValueMapper<T extends TokenTypeName = Type>(options?: {
    resolveAtDepth?: number;
  }): PickSwappedValueSignature<T> {
    // @ts-expect-error
    return this.#state.getValueMapper(options);
  }

  /* ------------------------------------------
     JSON methods
  --------------------------------------------- */

  /**
   * Get the JSON representation of the token value
   * @param options
   */
  getJSONValue(options?: {
    resolveToDepth?: number;
  }): PickTokenByType<Type>['$value'] {
    return this.#state.getJSONValue(options);
  }

  /**
   * Get the JSON representation of the token
   * @param options
   */
  getJSONToken(options?: {
    withExplicitType?: boolean;
    resolveToDepth?: number;
  }): PickTokenByType<Type> {
    //  @ts-expect-error - TokenState returns a broader type for performance reasons
    return this.#state.getJSONToken(options);
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
    const references = this.#state.referencesArray;
    return `Token {
  path: ${this.#state.stringPath},
  type: "${this.#state.type}",${
    this.#state.description
      ? `  description: "${this.#state.description}",`
      : ''
  }${
    this.#state.extensions
      ? `  extensions: ${JSON.stringify(this.#state.extensions)},`
      : ''
  }
  rawValues: ${
    rawValues.length > 0
      ? `[
    ${rawValues.map((node) => node.toString()).join(',\n    ')}
  ]`
      : '[]'
  }
  references: ${
    references.length > 0
      ? `[
    ${references.map((ref) => ref.toString()).join(',\n    ')}
  ]`
      : `[]`
  }
}`;
  }
}
