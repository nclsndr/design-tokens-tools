import { Option } from '@swan-io/boxed';
import { TreeNode } from './TreeNode.js';
import { JSONValuePath } from '../definitions/JSONDefinitions.js';

export class TreeNodesSet<T extends TreeNode> {
  readonly #nodes: Set<T>;

  constructor(initialNodes?: Array<T>) {
    this.#nodes = new Set(initialNodes);
  }

  get nodes() {
    return Array.from(this.#nodes);
  }

  get(path: JSONValuePath): Option<T> {
    for (const node of this.#nodes) {
      if (node.matchPath(path)) {
        return Option.Some(node);
      }
    }
    return Option.None();
  }

  register(item: T) {
    this.#nodes.add(item);
  }

  delete(path: JSONValuePath) {
    for (const node of this.#nodes) {
      if (node.matchPath(path)) {
        this.#nodes.delete(node);
        return;
      }
    }
  }

  debug() {
    console.info('TreeNodesSet:');
    this.#nodes.forEach((node) => console.info(node));
  }
}
