import { DesignToken, TokenTypeName } from 'design-tokens-format-module';
import { type JSON, ALIAS_PATH_SEPARATOR } from 'design-tokens-format-module';

import type { TreeState } from './TreeState.js';
import { TreeNode } from './TreeNode.js';
import { RawValueParts } from './RawValueParts.js';
import { deepSetJSONValue } from '../utils/deepSetJSONValue.js';
import { makeAliasStringPath } from '../parser/alias/makeAliasStringPath.js';
import { AnalyzedValue } from '../parser/internals/AnalyzedToken.js';
import { registerTokenRawValue } from './internals/registerTokenRawValue.js';
import { ReferencesSet } from './ReferencesSet.js';
import {
  AliasReference,
  makeValueMapper,
  PickSwappedValueSignature,
  ScalarValue,
  ValueMapper,
} from './ValueMapper.js';
import { ReferenceResolutionTrace } from './internals/ReferenceResolutionTrace.js';
import { RawValuePart } from './RawValuePart.js';
import { JSONPath } from '../utils/JSONPath.js';
import { Reference } from './Reference.js';

export class TokenState<
  Type extends TokenTypeName = TokenTypeName,
> extends TreeNode {
  #type: Type;
  #treeState: TreeState;
  #rawValueParts: RawValueParts;
  constructor(
    path: JSON.ValuePath,
    type: Type,
    description: string | undefined,
    extensions: Record<string, any> | undefined,
    treeState: TreeState,
  ) {
    super(path, description, extensions);
    this.#type = type;
    this.#treeState = treeState;
    this.#rawValueParts = new RawValueParts();
  }

  get treeState() {
    return this.#treeState;
  }

  get rawValueParts() {
    return this.#rawValueParts;
  }

  get references() {
    return new ReferencesSet().register(
      ...this.#treeState.references.getManyFrom({
        fromTreePath: this.path,
      }),
    );
  }

  get type() {
    return this.#type;
  }

  registerAnalyzedValue(analyzedValue: AnalyzedValue) {
    return registerTokenRawValue(analyzedValue, this);
  }

  getValueMapper(options?: {
    resolveAtDepth?: number;
  }): PickSwappedValueSignature<Type> {
    const { resolveAtDepth } = options ?? {};
    if (typeof resolveAtDepth === 'number' && resolveAtDepth < 1) {
      throw new Error('Depth must be greater or equal to 1');
    }

    const aliasReferences: Array<AliasReference> = [];
    const scalarValues: Array<ScalarValue> = [];

    if (resolveAtDepth !== undefined) {
      for (const ref of this.references) {
        const { raws, refs } = ref.resolve(resolveAtDepth ?? Infinity);
        scalarValues.push(...raws.map((r) => new ScalarValue(r, r.path, this)));
        aliasReferences.push(...refs.map((r) => new AliasReference(r, this)));
      }
    } else {
      aliasReferences.push(
        ...this.references.nodes.map(
          (reference) => new AliasReference(reference, this),
        ),
      );
    }

    const nativeScalarValues = this.rawValueParts.nodes.map(
      (r) => new ScalarValue(r, r.path, this),
    );

    const mergedValues = [
      ...aliasReferences,
      ...scalarValues,
      ...nativeScalarValues,
    ];

    return makeValueMapper(
      mergedValues.map((v) => ({
        currentValuePath: v.valuePath,
        data: new ValueMapper(v, this),
      })),
      this,
    ) as any;
  }

  // getResolvedJSONValue(): DesignToken['$value'] {
  //   let acc: any =
  //     this.type === 'gradient' || this.type === 'cubicBezier' ? [] : {};
  //
  //   this.references.map((ref) => {
  //     ref.isFullyResolved;
  //   });
  //
  //   return acc;
  // }

  getJSONValue(): DesignToken['$value'] {
    let acc: any =
      this.type === 'gradient' || this.type === 'cubicBezier' ? [] : {};

    for (const node of this.references.nodes) {
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
      $value: this.getJSONValue() as any,
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
  },
  references: ${
    this.references.size > 0
      ? `[
    ${this.references.map((node) => node.toString()).join(',\n    ')}
  ]`
      : '[]'
  }
}`;
  }
}
