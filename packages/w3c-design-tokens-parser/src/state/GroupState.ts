import { TreeNode } from './TreeNode.js';
import {
  type JSON,
  TokenTypeName,
  GroupProperties,
} from 'design-tokens-format-module';

export class GroupState extends TreeNode {
  #tokenType: TokenTypeName | undefined;

  constructor(
    path: JSON.ValuePath,
    tokenType: TokenTypeName | undefined,
    description: string | undefined,
    extensions: Record<string, any> | undefined,
  ) {
    super(path, description, extensions);
    this.#tokenType = tokenType;
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
