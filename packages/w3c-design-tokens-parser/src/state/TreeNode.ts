import { JSONValuePath } from '../definitions/JSONDefinitions.js';
import { ANALYZER_PATH_SEPARATOR } from '../parser/internals/AnalyzerContext.js';

export class TreeNode {
  #arrayPath: JSONValuePath;
  #stringPath: string;
  #description: string | undefined;
  #extensions: Record<string, any> | undefined;

  constructor(
    path: JSONValuePath,
    description?: string,
    extensions?: Record<string, any>,
  ) {
    this.#arrayPath = path;
    this.#description = description;
    this.#extensions = extensions;

    this.#stringPath = path.join(ANALYZER_PATH_SEPARATOR);
  }

  get path() {
    return this.#arrayPath;
  }
  get stringPath() {
    return this.#stringPath;
  }
  get description() {
    return this.#description;
  }
  get extensions() {
    return this.#extensions;
  }

  get isRoot() {
    return this.#arrayPath.length === 0;
  }

  matchPath(path: JSONValuePath) {
    return this.#stringPath === path.join(ANALYZER_PATH_SEPARATOR);
  }
}
