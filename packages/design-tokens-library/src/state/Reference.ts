import { Option } from 'effect';
import { type Json, TokenTypeName } from 'design-tokens-format-module';
import { JSONPath } from '@nclsndr/design-tokens-utils';

import { TreeState } from './TreeState.js';
import { RawValuePart } from './RawValuePart.js';

export class Reference {
  readonly #treeState: TreeState;
  readonly #fromId: string;
  readonly #fromValuePath: JSONPath;
  readonly #toId: string | undefined;
  #toTreePathFallback: JSONPath | undefined;
  #toType: TokenTypeName | undefined;

  constructor(
    fromId: string,
    fromValuePath: Json.ValuePath,
    toId: string | undefined,
    toTreePathFallback: Json.ValuePath | undefined,
    toType: TokenTypeName | undefined,
    treeState: TreeState,
  ) {
    this.#fromId = fromId;
    this.#fromValuePath = JSONPath.fromJSONValuePath(fromValuePath);
    this.#toId = toId;
    this.#toTreePathFallback =
      toTreePathFallback !== undefined
        ? JSONPath.fromJSONValuePath(toTreePathFallback)
        : undefined;
    this.#toType = toType;
    this.#treeState = treeState;
  }

  get fromId() {
    return this.#fromId;
  }
  get fromValuePath() {
    return this.#fromValuePath;
  }
  get toId() {
    return this.#toId;
  }
  get toType() {
    return this.#toType;
  }

  get fromTreePath() {
    return Option.match(this.#treeState.tokenStates.getOneById(this.#fromId), {
      onSome: (tokenState) => JSONPath.fromJSONValuePath(tokenState.path),
      onNone: () => {
        throw new Error('Token state not found for ' + this.#fromId);
      },
    });
  }
  get toTreePath() {
    return Option.match(this.#treeState.tokenStates.getOneById(this.#toId), {
      onSome: (tokenState) => JSONPath.fromJSONValuePath(tokenState.path),
      onNone: () => {
        // Reference is unlinked
        if (this.#toTreePathFallback !== undefined) {
          return this.#toTreePathFallback;
        }
        throw new Error('Token state not found for ' + this.#toId);
      },
    });
  }

  /**
   * Whether the reference is resolvable at the first level
   */
  get isShallowlyLinked() {
    return Option.match(this.#treeState.tokenStates.getOneById(this.#toId), {
      onSome: () => true,
      onNone: () => false,
    });
  }

  /**
   * Whether the reference is recursively resolvable
   */
  get isFullyLinked(): boolean {
    return Option.match(this.#treeState.tokenStates.getOneById(this.#toId), {
      onSome: (tokenState) => {
        return tokenState.referencesArray.reduce((acc, ref) => {
          return acc && ref.isFullyLinked;
        }, true);
      },
      onNone: () => false,
    });
  }

  /**
   * Whether the initiator of the reference is a token or a property of a composite token.
   */
  get isTopLevel() {
    return this.#fromValuePath.length === 0;
  }

  // TODO @Nico: provide tests
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
      Option.match(this.#treeState.tokenStates.getOneById(this.#toId), {
        onSome: (tokenState) => {
          acc.refs.push(
            new Reference(
              prevRef.fromId,
              currentRef.fromValuePath.array,
              tokenState.id,
              undefined,
              tokenState.type,
              this.#treeState,
            ),
          );
        },
        onNone: () => {
          acc.refs.push(
            new Reference(
              prevRef.fromId,
              currentRef.fromValuePath.array,
              undefined,
              this.toTreePath.array,
              this.toType,
              this.#treeState,
            ),
          );
        },
      });
      return acc;
    }

    Option.match(this.#treeState.tokenStates.getOneById(this.#toId), {
      onSome: (tokenState) => {
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
        for (const ref of tokenState.referencesSet) {
          ref.resolve(depth, currentDepth + 1, currentRef, acc);
        }
      },
      onNone: () => {
        acc.refs.push(
          new Reference(
            currentRef.fromId,
            currentRef.fromValuePath.array,
            undefined,
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
  fromId: ${this.fromId},
  fromValuePath: ${this.fromValuePath.toDebugString()},
  toId: ${this.toId},
  toTreePathFallback: ${this.#toTreePathFallback?.toDebugString()},
  toType: ${this.toType}
}`;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `Reference ${this.toString()}`;
  }
}
