import { type JSON, TokenTypeName } from 'design-tokens-format-module';
import { JSONPath } from '../utils/JSONPath.js';
import { TreeState } from './TreeState.js';
import { RawValuePart } from './RawValuePart.js';

export class Reference {
  readonly #treeState: TreeState;
  readonly #fromTreePath: JSONPath;
  readonly #fromValuePath: JSONPath;

  readonly #toTreePath: JSONPath;
  readonly #toType: TokenTypeName | undefined;

  constructor(
    fromTreePath: JSON.ValuePath,
    fromValuePath: JSON.ValuePath,
    toTreePath: JSON.ValuePath,
    toType: TokenTypeName | undefined,
    treeState: TreeState,
  ) {
    this.#fromTreePath = JSONPath.fromJSONValuePath(fromTreePath);
    this.#fromValuePath = JSONPath.fromJSONValuePath(fromValuePath);
    this.#toTreePath = JSONPath.fromJSONValuePath(toTreePath);
    this.#toType = toType;
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

  /**
   * Whether the reference is resolvable at the first level
   */
  get isShallowlyLinked() {
    return this.#treeState.tokenStates.get(this.#toTreePath).match({
      Some: () => true,
      None: () => false,
    });
  }

  /**
   * Whether the reference is recursively resolvable
   */
  get isFullyLinked(): boolean {
    return this.#treeState.tokenStates.get(this.#toTreePath).match({
      Some: (tokenState) => {
        return tokenState.references.nodes.reduce((acc, ref) => {
          return acc && ref.isFullyLinked;
        }, true);
      },
      None: () => false,
    });
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
  isShallowlyResolved: ${this.isShallowlyLinked ? 'true' : 'false'},
  isFullyResolved: ${this.isFullyLinked ? 'true' : 'false'}
}`;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `Reference ${this.toString()}`;
  }
}
