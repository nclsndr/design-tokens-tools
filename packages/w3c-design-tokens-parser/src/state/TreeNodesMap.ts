import { Option } from 'effect';
import { type JSON } from 'design-tokens-format-module';

import { TreeNode } from './TreeNode.js';
import { JSONPath } from '../utils/JSONPath.js';

export class TreeNodesMap<T extends TreeNode> {
  readonly #nodes: Map<string, T>;

  constructor(initialNodes?: Array<T>) {
    this.#nodes = new Map(initialNodes?.map((n) => [n.id, n]));
  }

  get ids() {
    return Array.from(this.#nodes.keys());
  }

  get nodes() {
    return Array.from(this.#nodes.values());
  }

  get size() {
    return this.#nodes.size;
  }

  /**
   * Get a node by its id
   * @param id
   */
  getOneById(id: string | undefined): Option.Option<T> {
    if (id === undefined) return Option.none();
    const maybeNode = this.#nodes.get(id);
    return maybeNode ? Option.some(maybeNode) : Option.none();
  }

  /**
   * Get a node by its path
   * Use `getOneById` for better performance
   * @param path
   */
  getOneByPath(path: JSON.ValuePath | JSONPath): Option.Option<T> {
    for (const [id, node] of this.#nodes) {
      if (path instanceof JSONPath) {
        if (node.equalsJSONPath(path)) {
          return Option.some(node);
        }
      } else {
        if (node.matchPath(path)) {
          return Option.some(node);
        }
      }
    }
    return Option.none();
  }

  /**
   *
   * @param path
   */
  hasOneByPath(path: JSON.ValuePath | JSONPath): boolean {
    for (const [id, node] of this.#nodes) {
      if (path instanceof JSONPath) {
        if (node.equalsJSONPath(path)) {
          return true;
        }
      } else {
        if (node.matchPath(path)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Add a tree node
   * @param node
   */
  add(node: T) {
    this.#nodes.set(node.id, node);
  }

  debug() {
    console.info('TreeNodesMap:');
    this.#nodes.forEach((node) => console.info(node));
  }

  map<U>(fn: (node: T, i: number, xs: Array<T>) => U): Array<U> {
    return Array.from(this.#nodes.values()).map(fn);
  }

  [Symbol.iterator]() {
    return this.#nodes;
  }
}
