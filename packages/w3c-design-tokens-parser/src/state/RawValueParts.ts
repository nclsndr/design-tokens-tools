import { Option } from '@swan-io/boxed';
import { type JSON } from 'design-tokens-format-module';

import { RawValuePart } from './RawValuePart.js';

export class RawValueParts {
  readonly #nodes: Set<RawValuePart> = new Set();

  get set() {
    return this.#nodes;
  }

  get nodes() {
    return Array.from(this.#nodes);
  }

  get size() {
    return this.#nodes.size;
  }

  get(path: JSON.ValuePath): Option<RawValuePart> {
    const found = Array.from(this.#nodes).find((node) =>
      node.path.equals(path),
    );
    return found ? Option.Some(found) : Option.None();
  }

  add(node: RawValuePart) {
    this.#nodes.add(node);
  }

  clear() {
    this.#nodes.clear();
  }

  debug() {
    console.info('RawValueParts:');
    this.#nodes.forEach((node) => console.info(node));
  }

  [Symbol.iterator]() {
    return this.#nodes.values();
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `RawValueParts ${
      this.#nodes.size > 0
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
