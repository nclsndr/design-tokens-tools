import { TokenTypeName } from '../../definitions/tokenTypes.js';
import { JSONValuePath } from '../../definitions/JSONDefinitions.js';
import { ANALYZER_PATH_SEPARATOR } from './AnalyzerContext.js';

export type AnalyzedValue<Raw = unknown> = {
  raw: Raw;
  toReferences: Array<{
    fromTreePath: JSONValuePath;
    fromValuePath: JSONValuePath;
    toTreePath: JSONValuePath;
  }>;
};

export class AnalyzedToken<
  Type extends TokenTypeName = TokenTypeName,
  Value = unknown,
> {
  readonly #path: JSONValuePath;
  readonly #stringPath: string;
  readonly #type: Type;
  readonly #value: AnalyzedValue<Value>;
  readonly #description: string | undefined;
  readonly #extensions: Record<string, any> | undefined;

  constructor(
    path: JSONValuePath,
    type: Type,
    value: AnalyzedValue<Value>,
    description?: string,
    extensions?: Record<string, any>,
  ) {
    this.#path = path;
    this.#stringPath = path.join(ANALYZER_PATH_SEPARATOR);
    this.#type = type;
    this.#value = value;
    this.#description = description;
    this.#extensions = extensions;
  }

  get path() {
    return this.#path;
  }
  get stringPath() {
    return this.#stringPath;
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

  matchPath(path: JSONValuePath) {
    return this.#stringPath === path.join(ANALYZER_PATH_SEPARATOR);
  }

  toJSON() {
    return {
      path: this.#path.slice(),
      type: this.#type,
      value: this.#value,
      description: this.#description,
      extensions: this.#extensions,
    };
  }
  toString() {
    return JSON.stringify({
      path: this.#path.slice(),
      type: this.#type,
      value: this.#value,
      description: this.#description,
      extensions: this.#extensions,
    });
  }
  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `AnalyzedToken {
  path: [${this.#path.map((v) => `"${v}"`).join(', ')}],
  type: "${this.#type}",
  value: ${JSON.stringify(this.#value.raw)},
}`;
  }
}
