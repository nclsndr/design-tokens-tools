import { Option } from '@swan-io/boxed';
import { type JSON } from 'design-tokens-format-module';

import { TreeNode } from './TreeNode.js';
import { JSONPath } from '../utils/JSONPath.js';

export class TreeNodesSet<T extends TreeNode> {
  readonly #nodes: Set<T>;

  constructor(initialNodes?: Array<T>) {
    this.#nodes = new Set(initialNodes);
  }

  get nodes() {
    return Array.from(this.#nodes);
  }

  get(path: JSON.ValuePath | JSONPath): Option<T> {
    for (const node of this.#nodes) {
      if (path instanceof JSONPath) {
        if (node.equalsJSONPath(path)) {
          return Option.Some(node);
        }
      } else {
        if (node.matchPath(path)) {
          return Option.Some(node);
        }
      }
    }
    return Option.None();
  }

  register(item: T) {
    this.#nodes.add(item);
  }

  delete(path: JSON.ValuePath) {
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
