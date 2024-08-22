import { type JSON } from 'design-tokens-format-module';
import { JSONPath } from '../utils/JSONPath.js';
import { ReferenceResolutionTrace } from '../parser/internals/ReferenceResolutionTrace.js';

export class Reference {
  readonly #fromTreePath: JSONPath;
  readonly #fromValuePath: JSONPath;

  readonly #toTreePath: JSONPath;

  readonly #resolutionTraces: Array<ReferenceResolutionTrace>;
  readonly #isFullyResolved: boolean;

  constructor(
    fromTreePath: JSON.ValuePath,
    fromValuePath: JSON.ValuePath,
    toTreePath: JSON.ValuePath,
    resolutionTraces: Array<ReferenceResolutionTrace>,
  ) {
    this.#fromTreePath = JSONPath.fromJSONValuePath(fromTreePath);
    this.#fromValuePath = JSONPath.fromJSONValuePath(fromValuePath);
    this.#toTreePath = JSONPath.fromJSONValuePath(toTreePath);
    this.#resolutionTraces = resolutionTraces;
    this.#isFullyResolved = resolutionTraces.every(
      (trace) => trace.status === 'resolved',
    );
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
  get resolutionTraces() {
    return this.#resolutionTraces;
  }
  get isFullyResolved() {
    return this.#isFullyResolved;
  }

  get isTopLevel() {
    return this.#fromValuePath.length === 0;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `Reference {
  from: {
    treePath: ${this.#fromTreePath.toDebugString()},
    valuePath: ${this.#fromValuePath.toDebugString()},
  },
  to: {
    treePath: ${this.#toTreePath.toDebugString()},
  },
  status: ${this.#isFullyResolved ? '"resolved"' : '"unresolvable"'},
  resolutionTraces: ${
    this.#resolutionTraces.length > 0
      ? `[
    ${this.#resolutionTraces.map((trace) => JSON.stringify(trace)).join(',\n    ')}
  ]`
      : '[]'
  }
}`;
  }
}
