import { Option } from 'effect';
import type {
  DesignToken,
  TokenTypeName,
  Json as JSONTypes,
} from 'design-tokens-format-module';
import { parser } from '@nclsndr/w3c-design-tokens-parser';
import { deepSetJSONValue } from '@nclsndr/design-tokens-utils';

import type { TreeState } from '../tree/TreeState.js';
import { TreeNode } from '../tree/TreeNode.js';
import { RawValuePartsSet } from './RawValuePartsSet.js';
import { registerTokenRawValue } from './registerTokenRawValue.js';
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
  #rawValueParts: RawValuePartsSet;

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
    this.#rawValueParts = new RawValuePartsSet();
  }

  /**
   * Access the token type.
   */
  get type(): Type {
    return this.#type;
  }

  /**
   * Access the tree state of the token.
   * @internal
   */
  get treeState() {
    return this.#treeState;
  }

  /**
   * Access the raw value parts of the token.
   * @internal
   */
  get rawValuePartsSet() {
    return this.#rawValueParts;
  }

  /**
   * Access the references of the token.
   */
  get references() {
    return this.#treeState.references.getManyFromId(this.id);
  }

  /**
   * Register the raw value parts of the token once analyzed.
   * Only used by the token tree parser.
   * @internal
   * @param analyzedValue
   */
  registerAnalyzedValueRawParts(analyzedValue: parser.AnalyzedValue) {
    return registerTokenRawValue(analyzedValue, this);
  }

  /**
   * Manipulate the token value by mapping all the possible values of any token.
   * @param options
   * @param options.resolveAtDepth - The depth at which to resolve the token references. Default: 0.
   */
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
      for (const ref of this.references) {
        const { raws, refs } = ref.resolve(computedResolutionAtDepth);
        scalarValues.push(
          ...raws.map((r) => new ScalarValue(r.value, r.path, this)),
        );
        aliasReferences.push(...refs.map((r) => new AliasReference(r, this)));
      }
    } else {
      aliasReferences.push(
        ...this.references.map(
          (reference) => new AliasReference(reference, this),
        ),
      );
    }

    const nativeScalarValues = this.rawValuePartsSet.nodes.map(
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

  /**
   * Get the JSON value of the token.
   * @param options
   * @param options.resolveAtDepth - The depth at which to resolve the token references. Default: 0.
   */
  getJSONValue(options?: { resolveAtDepth?: number | 'infinity' }) {
    const resolveAtDepth =
      options?.resolveAtDepth === 'infinity'
        ? Infinity
        : options?.resolveAtDepth;

    let acc: any =
      this.type === 'gradient' || this.type === 'cubicBezier' ? [] : {};

    for (const ref of this.references) {
      if (resolveAtDepth !== undefined) {
        const { raws, refs } = ref.resolve(resolveAtDepth);
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

  /**
   * Get the JSON token of the token.
   * @param options
   * @param options.withExplicitType - Whether to force to include the type in the token whenever the source token relied on context definition (alias or group). Default: false.
   * @param options.resolveAtDepth - The depth at which to resolve the token references. Default: 0.
   */
  getJSONToken(options?: {
    withExplicitType?: boolean;
    resolveAtDepth?: number | 'infinity';
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

  /**
   * Get the JSON representation of the token.
   * @internal - used by JSON.stringify
   */
  toJSON() {
    return this.getJSONToken();
  }

  /**
   * Get a debug-friendly string representation of the token state.
   */
  override toString() {
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
    this.references.length > 0
      ? `[
    ${this.references.map((node) => node.toString()).join(',\n    ')}
  ]`
      : '[]'
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
