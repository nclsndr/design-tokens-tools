import { Reference } from './Reference.js';
import { type JSON } from 'design-tokens-format-module';
import { Option } from '@swan-io/boxed';

export class ReferencesSet {
  readonly #nodes: Array<Reference> = [];

  get nodes() {
    return this.#nodes.slice();
  }

  get size() {
    return this.#nodes.length;
  }

  get({
    fromTreePath,
    fromValuePath,
  }: {
    fromTreePath: JSON.ValuePath;
    fromValuePath: JSON.ValuePath;
  }): Option<Reference> {
    const found = this.#nodes.find(
      (reference) =>
        reference.fromTreePath.equals(fromTreePath) &&
        reference.fromValuePath.equals(fromValuePath),
    );
    return found ? Option.Some(found) : Option.None();
  }

  getManyFrom({
    fromTreePath,
    fromValuePath,
  }: {
    fromTreePath: JSON.ValuePath;
    fromValuePath?: JSON.ValuePath;
  }) {
    return this.#nodes.filter((reference) => {
      const matchesFromTreePath = reference.fromTreePath.equals(fromTreePath);
      if (matchesFromTreePath && fromValuePath) {
        return (
          matchesFromTreePath && reference.fromValuePath.equals(fromValuePath)
        );
      }
      return matchesFromTreePath;
    });
  }

  register(...references: Array<Reference>) {
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
