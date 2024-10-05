import { TreeNode } from '../tree/TreeNode.js';
import {
  type Json,
  TokenTypeName,
  GroupProperties,
} from 'design-tokens-format-module';
import { TreeState } from '../tree/TreeState.js';

/**
 * A group of tokens within the tree.
 */
export class GroupState extends TreeNode {
  #treeState: TreeState;
  #tokenType: TokenTypeName | undefined;

  constructor(
    id: string,
    path: Json.ValuePath,
    tokenType: TokenTypeName | undefined,
    description: string | undefined,
    extensions: Record<string, any> | undefined,
    treeState: TreeState,
  ) {
    super(id, path, description, extensions);
    this.#tokenType = tokenType;
    this.#treeState = treeState;
  }

  /**
   * Access the token type if defined.
   */
  get tokenType() {
    return this.#tokenType;
  }

  /**
   * Get the JSON properties of the group. It excepts the children: nested groups and tokens.
   */
  getJSONProperties() {
    const properties: GroupProperties = {};
    if (this.description) {
      properties.$description = this.description;
    }
    if (this.extensions) {
      properties.$extensions = this.extensions;
    }
    if (this.tokenType) {
      properties.$type = this.tokenType;
    }
    return properties;
  }

  /**
   * Get the children of the group.
   * @param options
   * @param options.upToDepth - The depth of the children to get.
   */
  getTokenChildren(options?: { upToDepth?: number }) {
    return this.#treeState.tokenStates.getChildrenOfPath(this.path, options);
  }

  /**
   * Get the children of the group.
   * @param options
   * @param options.upToDepth - The depth of the children to get.
   */
  getGroupChildren(options?: { upToDepth?: number }) {
    return this.#treeState.groupStates.getChildrenOfPath(this.path, options);
  }

  /**
   * Get the JSON representation of the group.
   * @internal - used by JSON.stringify
   */
  toJSON() {
    return this.getJSONProperties();
  }

  /**
   * Get the string representation of the group.
   */
  override toString() {
    return `GroupState {
  id: ${this.id},
  path: ${this.stringPath},
  tokenType: ${this.tokenType},
  children: {
    groups: ${this.getGroupChildren().length},
    tokens: ${this.getTokenChildren().length},
  }
}`;
  }

  /**
   * Override console.log in Node.js environment
   * @internal
   * @param _depth
   * @param _opts
   */
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return this.toString();
  }
}
