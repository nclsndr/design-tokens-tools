import { Reference } from './Reference.js';
import { type JSON } from 'design-tokens-format-module';

export class ReferencesSet {
  readonly #nodes: Array<Reference> = [];

  get nodes() {
    return this.#nodes.slice();
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
  }

  debug() {
    console.info('References:');
    this.#nodes.map((node) => console.info(node));
  }
}
