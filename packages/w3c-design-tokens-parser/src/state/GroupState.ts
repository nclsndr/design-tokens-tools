import { TreeNode } from './TreeNode.js';
import {
  type JSON,
  TokenTypeName,
  GroupProperties,
} from 'design-tokens-format-module';
import { TreeState } from './TreeState.js';

export class GroupState extends TreeNode {
  #treeState: TreeState;
  #tokenType: TokenTypeName | undefined;

  constructor(
    id: string,
    path: JSON.ValuePath,
    tokenType: TokenTypeName | undefined,
    description: string | undefined,
    extensions: Record<string, any> | undefined,
    treeState: TreeState,
  ) {
    super(id, path, description, extensions);
    this.#tokenType = tokenType;
    this.#treeState = treeState;
  }

  get tokenType() {
    return this.#tokenType;
  }

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

  toJSON() {
    return this.getJSONProperties();
  }
}
