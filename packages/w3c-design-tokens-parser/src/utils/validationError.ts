import { JSONValuePath } from '../definitions/JSONDefinitions.js';

export class ValidationError extends Error {
  type: 'Type' | 'Value' | 'Computation';
  isCritical: boolean;
  treePath: JSONValuePath;
  nodeKey: '$type' | '$value' | '$description' | '$extensions' | undefined;
  valuePath: JSONValuePath;
  referenceToTreePath: JSONValuePath | undefined;

  constructor({
    type,
    message,
    treePath,
    nodeKey,
    valuePath,
    referenceToTreePath,
    isCritical,
  }: {
    type: 'Type' | 'Value' | 'Computation';
    message: string;
    treePath: JSONValuePath;
    nodeKey?: '$type' | '$value' | '$description' | '$extensions' | undefined;
    valuePath?: JSONValuePath | undefined;
    referenceToTreePath?: JSONValuePath;
    isCritical?: boolean;
  }) {
    super(message);
    this.type = type;
    this.name = 'ValidationError';
    this.treePath = treePath;
    this.nodeKey = nodeKey;
    this.valuePath = valuePath ?? [];
    this.referenceToTreePath = referenceToTreePath;
    this.isCritical = isCritical ?? false;
  }

  toJSON() {
    return {
      type: this.type,
      isCritical: this.isCritical,
      treePath: this.treePath,
      nodeKey: this.nodeKey,
      valuePath: this.valuePath,
      referenceToTreePath: this.referenceToTreePath,
      message: this.message,
    };
  }

  override toString() {
    return `ValidationError {
  type: "${this.type}",
  isCritical: ${this.isCritical},
  treePath: ${JSON.stringify(this.treePath)},
  nodeKey: ${this.nodeKey !== undefined ? `"${this.nodeKey}"` : 'undefined'},
  valuePath: ${JSON.stringify(this.valuePath)},
  referenceToTreePath: ${this.referenceToTreePath ? JSON.stringify(this.referenceToTreePath) : 'undefined'},
  message: "${this.message}",
}`;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `ValidationError {
  type: "${this.type}",
  isCritical: ${this.isCritical},
  treePath: ${JSON.stringify(this.treePath)},
  nodeKey: ${this.nodeKey !== undefined ? `"${this.nodeKey}"` : 'undefined'},
  valuePath: ${JSON.stringify(this.valuePath)},
  referenceToTreePath: ${this.referenceToTreePath ? JSON.stringify(this.referenceToTreePath) : 'undefined'},
  message: "${this.message}",
}`;
  }
}
