import {
  type Json,
  TokenTypeName,
  ALIAS_PATH_SEPARATOR,
} from 'design-tokens-format-module';
import { ResolutionType } from './recursivelyResolveTokenType.js';

export type AnalyzedValue<Raw = unknown> = {
  raw: Raw;
  toReferences: Array<{
    fromTreePath: Json.ValuePath;
    fromValuePath: Json.ValuePath;
    toTreePath: Json.ValuePath;
  }>;
};

export class AnalyzedToken<
  Type extends TokenTypeName = TokenTypeName,
  Value = unknown,
> {
  readonly #id: string;
  readonly #path: Json.ValuePath;
  readonly #stringPath: string;
  readonly #typeResolution: ResolutionType;
  readonly #type: Type;
  readonly #value: AnalyzedValue<Value>;
  readonly #description: string | undefined;
  readonly #extensions: Record<string, any> | undefined;

  constructor(
    id: string,
    path: Json.ValuePath,
    type: Type,
    value: AnalyzedValue<Value>,
    typeResolution: ResolutionType,
    description?: string,
    extensions?: Record<string, any>,
  ) {
    this.#id = id;
    this.#path = path;
    this.#stringPath = path.join(ALIAS_PATH_SEPARATOR);
    this.#typeResolution = typeResolution;
    this.#type = type;
    this.#value = value;
    this.#description = description;
    this.#extensions = extensions;
  }

  get id() {
    return this.#id;
  }
  get path(): Json.ValuePath {
    return this.#path;
  }
  get stringPath() {
    return this.#stringPath;
  }
  get typeResolution() {
    return this.#typeResolution;
  }
  get type() {
    return this.#type;
  }
  get value() {
    return this.#value;
  }
  get description() {
    return this.#description;
  }
  get extensions() {
    return this.#extensions;
  }

  matchPath(path: Json.ValuePath) {
    return this.#stringPath === path.join(ALIAS_PATH_SEPARATOR);
  }

  /**
   * @internal
   */
  toJSON() {
    return {
      id: this.#id,
      path: this.#path.slice(),
      type: this.#type,
      value: this.#value,
      description: this.#description,
      extensions: this.#extensions,
    };
  }

  /**
   * @internal
   */
  toString() {
    return JSON.stringify({
      id: this.#id,
      path: this.#path.slice(),
      type: this.#type,
      value: this.#value,
      description: this.#description,
      extensions: this.#extensions,
    });
  }

  /**
   * Override console.log in Node.js environment
   * @internal
   */
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `AnalyzedToken {
  path: [${this.#path.map((v) => `"${v}"`).join(', ')}],
  type: "${this.#type}",
  value: ${JSON.stringify(this.#value.raw)},
}`;
  }
}
