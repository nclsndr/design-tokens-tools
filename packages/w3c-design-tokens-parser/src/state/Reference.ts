import { type JSON, TokenTypeName } from 'design-tokens-format-module';
import { JSONPath } from '../utils/JSONPath.js';
import { ReferenceResolutionTrace } from './internals/ReferenceResolutionTrace.js';
import { TreeState } from './TreeState.js';
import { Option } from '@swan-io/boxed';
import { RawValuePart } from './RawValuePart.js';

export class Reference {
  readonly #treeState: TreeState;
  readonly #fromTreePath: JSONPath;
  readonly #fromValuePath: JSONPath;

  readonly #toTreePath: JSONPath;
  readonly #toType: TokenTypeName | undefined;

  readonly #resolutionTraces: Array<ReferenceResolutionTrace>;

  constructor(
    fromTreePath: JSON.ValuePath,
    fromValuePath: JSON.ValuePath,
    toTreePath: JSON.ValuePath,
    toType: TokenTypeName | undefined,
    resolutionTraces: Array<ReferenceResolutionTrace>,
    treeState: TreeState,
  ) {
    this.#fromTreePath = JSONPath.fromJSONValuePath(fromTreePath);
    this.#fromValuePath = JSONPath.fromJSONValuePath(fromValuePath);
    this.#toTreePath = JSONPath.fromJSONValuePath(toTreePath);
    this.#toType = toType;
    this.#resolutionTraces = resolutionTraces;
    this.#treeState = treeState;
  }

  get fromTreePath() {
    return this.#fromTreePath;
  }
  get fromValuePath() {
    return this.#fromValuePath;
  }
  get toTreePath() {
    return this.#toTreePath;
  }
  get toType() {
    return this.#toType;
  }
  get resolutionTraces() {
    return this.#resolutionTraces;
  }

  /**
   * Whether the reference is resolvable at the first level
   */
  get isShallowlyResolved() {
    return (
      (this.#resolutionTraces[0] ?? { status: 'unresolvable' }).status ===
      'resolved'
    );
  }

  /**
   * Whether the reference is recursively resolvable
   */
  get isFullyResolved() {
    return (
      this.#resolutionTraces.length > 0 &&
      this.#resolutionTraces.every((trace) => trace.status === 'resolved')
    );
  }

  /**
   * Whether the initiator of the reference is a token or a property of a composite token.
   */
  get isTopLevel() {
    return this.#fromValuePath.length === 0;
  }

  resolve(
    depth = Infinity,
    currentDepth = 0,
    prevRef: Reference = this,
    acc: { raws: RawValuePart[]; refs: Reference[] } = {
      raws: [],
      refs: [],
    },
  ) {
    const hasValuePath = this.#fromValuePath.first !== undefined;
    const currentRef = !hasValuePath ? prevRef : this;

    if (depth === currentDepth) {
      this.#treeState.tokenStates.get(this.#toTreePath).match({
        Some: (tokenState) => {
          acc.refs.push(
            new Reference(
              prevRef.fromTreePath.array,
              currentRef.fromValuePath.array,
              tokenState.path,
              tokenState.type,
              currentRef.resolutionTraces,
              this.#treeState,
            ),
          );
        },
        None: () => {
          acc.refs.push(
            new Reference(
              prevRef.fromTreePath.array,
              currentRef.fromValuePath.array,
              this.toTreePath.array,
              this.toType,
              currentRef.resolutionTraces,
              this.#treeState,
            ),
          );
        },
      });
      return acc;
    }

    this.#treeState.tokenStates.get(this.#toTreePath).match({
      Some: (tokenState) => {
        // We collect the raw value parts encountered along the way
        for (const rawPart of tokenState.rawValueParts) {
          acc.raws.push(
            new RawValuePart(
              currentRef.fromValuePath.append(...rawPart.path.array).array,
              rawPart.value,
            ),
          );
        }

        // We continue to resolve the references
        for (const ref of tokenState.references) {
          ref.resolve(depth, currentDepth + 1, currentRef, acc);
        }
      },
      None: () => {
        acc.refs.push(
          new Reference(
            currentRef.fromTreePath.array,
            currentRef.fromValuePath.array,
            this.toTreePath.array,
            this.toType,
            this.resolutionTraces,
            this.#treeState,
          ),
        );
      },
    });

    return acc;
  }

  toString() {
    return `{
  from: {
    treePath: ${this.#fromTreePath.toDebugString()},
    valuePath: ${this.#fromValuePath.toDebugString()},
  },
  to: {
    treePath: ${this.#toTreePath.toDebugString()},
  },
  isShallowlyResolved: ${this.isShallowlyResolved ? 'true' : 'false'},
  isFullyResolved: ${this.isFullyResolved ? 'true' : 'false'},
  resolutionTraces: ${
    this.#resolutionTraces.length > 0
      ? `[
    ${this.#resolutionTraces.map((trace) => JSON.stringify(trace)).join(',\n    ')}
  ]`
      : '[]'
  }
}`;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `Reference ${this.toString()}`;
  }
}
