import { JSONPath } from '../utils/JSONPath.js';
import { JSONValuePath } from '../definitions/JSONDefinitions.js';

export class RawValuePart {
  #path: JSONPath;
  #value: string | number | boolean | null;

  constructor(path: JSONValuePath, value: string | number | boolean | null) {
    this.#path = JSONPath.fromJSONValuePath(path);
    this.#value = value;
  }

  get path() {
    return this.#path;
  }

  get value() {
    return this.#value;
  }

  get isTopLevel() {
    return this.#path.length === 0;
  }

  toString() {
    return JSON.stringify({
      path: this.#path.array,
      value: this.#value,
    });
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return 'RawValuePart' + this.toString();
  }
}
