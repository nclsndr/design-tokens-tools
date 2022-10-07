import { RawValuePart } from './RawValuePart.js';

export class RawValueParts {
  readonly #nodes: Set<RawValuePart> = new Set();

  get set() {
    return this.#nodes;
  }

  get nodes() {
    return Array.from(this.#nodes);
  }

  add(node: RawValuePart) {
    this.#nodes.add(node);
  }

  debug() {
    console.info('RawValueParts:');
    this.#nodes.forEach((node) => console.info(node));
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `RawValueParts [
  ${Array.from(this.#nodes)
    .map((node) =>
      JSON.stringify({
        path: node.path,
        value: node.value,
      }),
    )
    .join(',\n  ')}
]`;
  }
}
