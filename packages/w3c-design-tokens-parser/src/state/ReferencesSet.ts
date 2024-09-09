import { Reference } from './Reference.js';
import { TreeState } from './TreeState.js';

export class ReferencesSet {
  readonly #treeState: TreeState;
  readonly #nodes: Array<Reference> = [];

  constructor(treeState: TreeState) {
    this.#treeState = treeState;
  }

  get size() {
    return this.#nodes.length;
  }

  getManyFromId(fromId: string) {
    return this.#nodes.filter((reference) => reference.fromId === fromId);
  }

  add(...references: Array<Reference>) {
    this.#nodes.push(...references);
    return this;
  }

  map<T>(fn: (reference: Reference) => T) {
    return this.#nodes.map(fn);
  }

  debug() {
    console.info('References:');
    this.#nodes.map((node) => console.info(node));
  }

  [Symbol.iterator]() {
    return this.#nodes[Symbol.iterator]();
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `ReferencesSet [
  ${Array.from(this.#nodes)
    .map((node) => node.toString().split('\n').join('\n  '))
    .join(',\n  ')}
]`;
  }
}
