import { Option } from 'effect';
import { type Json } from 'design-tokens-format-module';

import { RawValuePart } from './RawValuePart.js';

export class RawValuePartsSet {
  readonly #nodes: Array<RawValuePart> = [];

  get set() {
    return this.#nodes;
  }

  get nodes() {
    return Array.from(this.#nodes);
  }

  get size() {
    return this.#nodes.length;
  }

  get(path: Json.ValuePath): Option.Option<RawValuePart> {
    const found = Array.from(this.#nodes).find((node) =>
      node.path.equals(path),
    );
    return found ? Option.some(found) : Option.none();
  }

  add(node: RawValuePart) {
    this.#nodes.push(node);
  }

  clear() {
    this.#nodes.splice(0, this.#nodes.length);
  }

  [Symbol.iterator]() {
    return this.#nodes[Symbol.iterator]();
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `RawValueParts ${
      this.#nodes.length > 0
        ? `[
  ${Array.from(this.#nodes)
    .map((node) =>
      JSON.stringify({
        path: node.path,
        value: node.value,
      }),
    )
    .join(',\n  ')}
]`
        : `[]`
    }`;
  }
}
