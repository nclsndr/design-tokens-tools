import { ALIAS_PATH_SEPARATOR, type Json } from 'design-tokens-format-module';
import { JSONPath } from '@nclsndr/design-tokens-utils';

export class TreeNode {
  #id: string;
  #path: JSONPath;
  #description: string | undefined;
  #extensions: Record<string, any> | undefined;

  constructor(
    id: string,
    path: Json.ValuePath,
    description?: string,
    extensions?: Record<string, any>,
  ) {
    this.#id = id;
    this.#path = JSONPath.fromJSONValuePath(path);
    this.#description = description;
    this.#extensions = extensions;
  }

  /**
   * The tree node id.
   */
  get id() {
    return this.#id;
  }

  /**
   * The tree node path - array representation.
   */
  get path(): Json.ValuePath {
    return this.#path.array;
  }

  /**
   * The node name - last part of the path.
   */
  get name() {
    return this.#path.last;
  }

  /**
   * The tree node path - string representation.
   */
  get stringPath() {
    return this.#path.string;
  }

  /**
   * The tree node description.
   */
  get description() {
    return this.#description;
  }

  /**
   * The tree node extensions.
   */
  get extensions() {
    return this.#extensions;
  }

  /**
   * Whether the node is the root of the tree.
   */
  get isRoot() {
    return this.#path.isRoot;
  }

  /**
   * Matches a string patch against the node path.
   * The provided path must use the `.` character as separator.
   * @param stringPath
   */
  matchStringPath(stringPath: string) {
    return this.#path.equalsStringPath(stringPath);
  }

  /**
   * Matches an array based path against the node path.
   * @param path
   */
  matchValuePath(path: Json.ValuePath) {
    return this.#path.string === path.join(ALIAS_PATH_SEPARATOR);
  }

  /**
   * Matches a JSONPath instance against the node path.
   * @param path
   */
  matchJSONPath(path: JSONPath) {
    return this.#path.equalsJSONPath(path);
  }

  /**
   * Matches a path of Json.ValuePath | JSONPath | string against the node path.
   * @param path
   */
  matchMixedPath(path: Json.ValuePath | JSONPath | string) {
    if (path instanceof JSONPath) {
      return this.matchJSONPath(path);
    } else if (Array.isArray(path)) {
      return this.matchValuePath(path);
    } else {
      return this.matchStringPath(path);
    }
  }

  /**
   * Generate the W3C Design Tokens path to be used as an alias within the design tokens tree.
   */
  toDesignTokenAliasPath() {
    return this.#path.toDesignTokenAliasPath();
  }
}
