import {
  type Json,
  ALIAS_PATH_SEPARATOR,
  AliasValue,
} from 'design-tokens-format-module';

/**
 * A path is a sequence of strings and numbers that represent a path to a value in a JSON object.
 */
export class JSONPath {
  #array: Json.ValuePath;
  #string: string;
  #isRoot = false;
  constructor(path: Json.ValuePath) {
    this.#array = path;
    this.#string = path.join(ALIAS_PATH_SEPARATOR);
    this.#isRoot = path.length === 0;
  }

  static fromJSONValuePath(path: Json.ValuePath) {
    return new JSONPath(path);
  }

  get array(): Json.ValuePath {
    return this.#array;
  }
  get string() {
    return this.#string;
  }
  get isRoot() {
    return this.#isRoot;
  }
  get parent(): JSONPath {
    return JSONPath.fromJSONValuePath(this.#array.slice(0, -1));
  }
  get last() {
    return this.#array.at(-1);
  }
  get first() {
    return this.#array.at(0);
  }
  get head() {
    return JSONPath.fromJSONValuePath(this.#array.slice(0, -1));
  }
  get tail() {
    return JSONPath.fromJSONValuePath(this.#array.slice(1));
  }

  get length() {
    return this.#array.length;
  }

  join(separator: string) {
    return this.#array.join(separator);
  }

  equals(path: Json.ValuePath) {
    return this.#string === path.join(ALIAS_PATH_SEPARATOR);
  }

  equalsStringPath(stringPath: string) {
    return this.#string === stringPath;
  }

  equalsJSONPath(path: JSONPath) {
    return this.#string === path.string;
  }

  append(...values: Array<string | number>) {
    return new JSONPath([...this.#array, ...values]);
  }

  concat(...paths: Array<Json.ValuePath>) {
    return new JSONPath([...this.#array, ...paths.flat()]);
  }

  toDesignTokenAliasPath(): AliasValue {
    return `{${this.#string}}`;
  }

  toString() {
    return JSON.stringify({
      array: this.#array,
      string: this.#string,
    });
  }
  toJSON(): {
    array: Json.ValuePath;
    string: string;
  } {
    return {
      array: this.#array,
      string: this.#string,
    };
  }
  toDebugString() {
    return `[${this.#array.map((v) => (typeof v === 'string' ? `"${v}"` : v)).join(', ')}]`;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `Path {${this.toDebugString()}}`;
  }
}
