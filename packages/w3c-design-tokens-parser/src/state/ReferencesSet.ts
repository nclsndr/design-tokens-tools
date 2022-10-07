import { Reference } from './Reference.js';
import { JSONValuePath } from '../definitions/JSONDefinitions.js';

export class ReferencesSet {
  readonly #nodes: Array<Reference> = [];

  get nodes() {
    return this.#nodes.slice();
  }

  getManyFrom({
    fromTreePath,
    fromValuePath,
  }: {
    fromTreePath: JSONValuePath;
    fromValuePath?: JSONValuePath;
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
