import { type JSON } from 'design-tokens-format-module';

export class ValidationError extends Error {
  type: 'Type' | 'Value' | 'Computation';
  isCritical: boolean;
  nodeId: string;
  treePath: JSON.ValuePath;
  nodeKey: '$type' | '$value' | '$description' | '$extensions' | undefined;
  valuePath: JSON.ValuePath;
  referenceToTreePath: JSON.ValuePath | undefined;

  constructor({
    type,
    message,
    nodeId,
    treePath,
    nodeKey,
    valuePath,
    referenceToTreePath,
    isCritical,
  }: {
    type: 'Type' | 'Value' | 'Computation';
    message: string;
    nodeId: string;
    treePath: JSON.ValuePath;
    nodeKey?: '$type' | '$value' | '$description' | '$extensions' | undefined;
    valuePath?: JSON.ValuePath | undefined;
    referenceToTreePath?: JSON.ValuePath;
    isCritical?: boolean;
  }) {
    super(message);
    this.type = type;
    this.name = 'ValidationError';
    this.treePath = treePath;
    this.nodeId = nodeId;
    this.nodeKey = nodeKey;
    this.valuePath = valuePath ?? [];
    this.referenceToTreePath = referenceToTreePath;
    this.isCritical = isCritical ?? false;
  }

  toJSON(): {
    type: 'Type' | 'Value' | 'Computation';
    isCritical: boolean;
    nodeId: string;
    treePath: JSON.ValuePath;
    nodeKey: '$type' | '$value' | '$description' | '$extensions' | undefined;
    valuePath: JSON.ValuePath;
    referenceToTreePath: JSON.ValuePath | undefined;
    message: string;
  } {
    return {
      type: this.type,
      isCritical: this.isCritical,
      nodeId: this.nodeId,
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
  nodeId: "${this.nodeId}",
  treePath: ${JSON.stringify(this.treePath)},
  nodeKey: ${this.nodeKey !== undefined ? `"${this.nodeKey}"` : 'undefined'},
  valuePath: ${JSON.stringify(this.valuePath)},
  referenceToTreePath: ${this.referenceToTreePath ? JSON.stringify(this.referenceToTreePath) : 'undefined'},
  message: "${this.message}",
}`;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return this.toString();
  }
}
