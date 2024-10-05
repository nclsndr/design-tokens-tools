import { type Json } from 'design-tokens-format-module';
import { JSONPath } from '@nclsndr/design-tokens-utils';

export class RawValuePart<Value extends Json.Primitive = Json.Primitive> {
  #path: JSONPath;
  #value: Value;

  constructor(path: Json.ValuePath, value: Value) {
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
