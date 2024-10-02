import { Option } from 'effect';
import type {
  DesignToken,
  TokenTypeName,
  Json as JSONTypes,
} from 'design-tokens-format-module';
import { parser } from '@nclsndr/w3c-design-tokens-parser';
import { deepSetJSONValue } from '@nclsndr/design-tokens-utils';

import type { TreeState } from './TreeState.js';
import { TreeNode } from './TreeNode.js';
import { RawValueParts } from './RawValueParts.js';
import { registerTokenRawValue } from './internals/registerTokenRawValue.js';
import { ReferencesSet } from './ReferencesSet.js';
import {
  AliasReference,
  makeValueMapper,
  PickSwappedValueSignature,
  ScalarValue,
  ValueMapper,
} from './ValueMapper.js';

export class TokenState<
  Type extends TokenTypeName = TokenTypeName,
> extends TreeNode {
  #type: Type;
  #typeResolution: parser.ResolutionType;
  #treeState: TreeState;
  #rawValueParts: RawValueParts;

  constructor(
    id: string,
    path: JSONTypes.ValuePath,
    type: Type,
    typeResolution: parser.ResolutionType,
    description: string | undefined,
    extensions: Record<string, any> | undefined,
    treeState: TreeState,
  ) {
    super(id, path, description, extensions);
    this.#type = type;
    this.#typeResolution = typeResolution;
    this.#treeState = treeState;
    this.#rawValueParts = new RawValueParts();
  }

  get treeState() {
    return this.#treeState;
  }

  get rawValueParts() {
    return this.#rawValueParts;
  }

  get referencesSet() {
    return new ReferencesSet(this.#treeState).add(
      ...this.#treeState.references.getManyFromId(this.id),
    );
  }

  get referencesArray() {
    return this.#treeState.references.getManyFromId(this.id);
  }

  get type() {
    return this.#type;
  }

  registerAnalyzedValueRawParts(analyzedValue: parser.AnalyzedValue) {
    return registerTokenRawValue(analyzedValue, this);
  }

  getValueMapper(options?: {
    resolveAtDepth?: number | 'infinity';
  }): PickSwappedValueSignature<Type> {
    const { resolveAtDepth } = options ?? {};
    if (
      (typeof resolveAtDepth === 'number' && resolveAtDepth < 0) ||
      (typeof resolveAtDepth === 'string' && resolveAtDepth !== 'infinity')
    ) {
      throw new Error('resolveAtDepth must be "infinity" or greater than 0');
    }

    const aliasReferences: Array<AliasReference> = [];
    const scalarValues: Array<ScalarValue> = [];

    if (resolveAtDepth !== undefined) {
      const computedResolutionAtDepth =
        resolveAtDepth === 'infinity' ? Infinity : resolveAtDepth;
      for (const ref of this.referencesSet) {
        const { raws, refs } = ref.resolve(computedResolutionAtDepth);
        scalarValues.push(
          ...raws.map((r) => new ScalarValue(r.value, r.path, this)),
        );
        aliasReferences.push(...refs.map((r) => new AliasReference(r, this)));
      }
    } else {
      aliasReferences.push(
        ...this.referencesArray.map(
          (reference) => new AliasReference(reference, this),
        ),
      );
    }

    const nativeScalarValues = this.rawValueParts.nodes.map(
      (r) => new ScalarValue(r.value, r.path, this),
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

  getJSONValue(options?: { resolveToDepth?: number }) {
    const resolveToDepth =
      options?.resolveToDepth === -1 ? Infinity : options?.resolveToDepth;

    let acc: any =
      this.type === 'gradient' || this.type === 'cubicBezier' ? [] : {};

    for (const ref of this.referencesArray) {
      if (resolveToDepth !== undefined) {
        const { raws, refs } = ref.resolve(resolveToDepth);
        for (const raw of raws) {
          if (ref.isTopLevel) {
            acc = raw.value;
          } else {
            deepSetJSONValue(acc, raw.path.array, raw.value);
          }
        }
        for (const innerRef of refs) {
          if (ref.isTopLevel) {
            acc = innerRef.toTreePath.toDesignTokenAliasPath();
          } else {
            deepSetJSONValue(
              acc,
              innerRef.fromValuePath.array,
              innerRef.toTreePath.toDesignTokenAliasPath(),
            );
          }
        }
      } else {
        Option.match(this.#treeState.tokenStates.getOneById(ref.toId), {
          onSome: (tokenState) => {
            if (ref.isTopLevel) {
              acc = tokenState.toDesignTokenAliasPath();
            } else {
              deepSetJSONValue(
                acc,
                ref.fromValuePath.array,
                tokenState.toDesignTokenAliasPath(),
              );
            }
          },
          onNone: () => {
            if (ref.isTopLevel) {
              acc = ref.toTreePath.toDesignTokenAliasPath();
            } else {
              deepSetJSONValue(
                acc,
                ref.fromValuePath.array,
                ref.toTreePath.toDesignTokenAliasPath(),
              );
            }
          },
        });
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

  getJSONToken(options?: {
    withExplicitType?: boolean;
    resolveToDepth?: number;
  }) {
    const withExplicitType = options?.withExplicitType ?? false;

    const token: DesignToken = {
      $value: this.getJSONValue(options) as any,
    };
    if (withExplicitType || this.#typeResolution === 'explicit') {
      token.$type = this.#type;
    }
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
  id: "${this.id}",
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
    this.referencesArray.length > 0
      ? `[
    ${this.referencesArray.map((node) => node.toString()).join(',\n    ')}
  ]`
      : '[]'
  }
}`;
  }
}
