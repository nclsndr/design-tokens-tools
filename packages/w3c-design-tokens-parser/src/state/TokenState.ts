import { DesignToken } from 'design-tokens-format-module';
import { type JSON, ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';

import type { TreeState } from './TreeState.js';
import { TreeNode } from './TreeNode.js';
import { RawValueParts } from './RawValueParts.js';
import { deepSetJSONValue } from '../utils/deepSetJSONValue.js';
import { makeAliasStringPath } from '../parser/alias/makeAliasStringPath.js';
import { AnalyzedValue } from '../parser/internals/AnalyzedToken.js';
import { registerTokenRawValue } from './registerTokenRawValue.js';

export class TokenState extends TreeNode {
  #type: Required<DesignToken>['$type'];
  #treeState: TreeState;
  #rawValueParts: RawValueParts;
  constructor(
    path: JSON.ValuePath,
    type: Required<DesignToken>['$type'],
    description: string | undefined,
    extensions: Record<string, any> | undefined,
    treeState: TreeState,
  ) {
    super(path, description, extensions);
    this.#type = type;
    this.#treeState = treeState;
    this.#rawValueParts = new RawValueParts();
  }

  get rawValueParts() {
    return this.#rawValueParts;
  }

  get references() {
    return this.#treeState.references.getManyFrom({
      fromTreePath: this.path,
    });
  }

  get type() {
    return this.#type;
  }

  get computedReferences() {
    return this.#treeState.references.getManyFrom({
      fromTreePath: this.path,
    });
  }

  registerAnalyzedValue(analyzedValue: AnalyzedValue) {
    return registerTokenRawValue(analyzedValue, this);
  }

  getJSONValue() {
    let acc: any =
      this.type === 'gradient' || this.type === 'cubicBezier' ? [] : {};

    for (const node of this.computedReferences) {
      if (node.isTopLevel) {
        acc = makeAliasStringPath(node.toTreePath.array);
      } else {
        deepSetJSONValue(
          acc,
          node.fromValuePath.array,
          `{${node.toTreePath.array.join(ALIAS_PATH_SEPARATOR)}}`,
        );
      }
    }

    for (const node of this.#rawValueParts.set) {
      if (node.isTopLevel) {
        acc = node.value;
      } else {
        deepSetJSONValue(acc, node.path.array, node.value);
      }
    }

    return acc;
  }

  getJSONToken(): DesignToken {
    const token: DesignToken = {
      $type: this.#type,
      $value: this.getJSONValue(),
    };
    if (this.description) {
      token.$description = this.description;
    }
    if (this.extensions) {
      token.$extensions = this.extensions;
    }
    return token;
  }

  toJSON() {
    return this.getJSONToken();
  }

  override toString() {
    return JSON.stringify({
      path: this.path,
      type: this.#type,
    });
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    const rawValues = this.#rawValueParts.nodes;
    return `TokenState {
  path: ${JSON.stringify(this.path)},
  type: "${this.#type}",
  rawValues: ${
    rawValues.length > 0
      ? `[
    ${rawValues.map((node) => node.toString()).join(',\n    ')}
  ]`
      : '[]'
  }
}`;
  }
}
