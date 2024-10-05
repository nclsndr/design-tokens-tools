import { Option } from 'effect';
import { ALIAS_PATH_SEPARATOR, type Json } from 'design-tokens-format-module';
import { JSONPath } from '@nclsndr/design-tokens-utils';

import { TreeNode } from './TreeNode.js';

export class TreeNodesMap<T extends TreeNode> {
  readonly #nodes: Map<string, T>;

  constructor(initialNodes?: Array<T>) {
    this.#nodes = new Map(initialNodes?.map((n) => [n.id, n]));
  }

  /**
   * Get all the ids of the nodes.
   */
  get ids() {
    return Array.from(this.#nodes.keys());
  }

  /**
   * Get an array with all the nodes.
   */
  get nodes() {
    return Array.from(this.#nodes.values());
  }

  /**
   * Get the number of nodes in the state.
   */
  get size() {
    return this.#nodes.size;
  }

  /**
   * Get a node by its id
   * @param id - the unique id (in tree) of the node.
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
  getOneByPath(path: Json.ValuePath | JSONPath | string): Option.Option<T> {
    for (const [_, node] of this.#nodes) {
      if (node.matchMixedPath(path)) {
        return Option.some(node);
      }
    }
    return Option.none();
  }

  /**
   * Get all the children of a path
   * @param path
   * @param options
   * @param options.depth - the depth of the children to get. Default: Infinity.
   */
  getChildrenOfPath(
    path: Json.ValuePath | JSONPath,
    options?: {
      upToDepth?: number;
    },
  ): Array<T> {
    if (options?.upToDepth !== undefined && options?.upToDepth < 1) {
      throw new Error('The depth must be greater than 0');
    }
    const pathLength = path.length;
    const stringPath =
      path instanceof JSONPath ? path.string : path.join(ALIAS_PATH_SEPARATOR);
    const depth = options?.upToDepth ? pathLength + 1 : undefined;

    return Array.from(this.#nodes.values()).filter((node) => {
      return (
        (depth !== undefined ? node.path.length <= depth : true) &&
        node.path.slice(0, pathLength).join(ALIAS_PATH_SEPARATOR) === stringPath
      );
    });
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
