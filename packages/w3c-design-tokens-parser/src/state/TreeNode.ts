import { type JSON } from 'design-tokens-format-module';

import { ANALYZER_PATH_SEPARATOR } from '../parser/internals/AnalyzerContext.js';

export class TreeNode {
  #arrayPath: JSON.ValuePath;
  #stringPath: string;
  #description: string | undefined;
  #extensions: Record<string, any> | undefined;

  constructor(
    path: JSON.ValuePath,
    description?: string,
    extensions?: Record<string, any>,
  ) {
    this.#arrayPath = path;
    this.#description = description;
    this.#extensions = extensions;

    this.#stringPath = path.join(ANALYZER_PATH_SEPARATOR);
  }

  get path(): JSON.ValuePath {
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

  matchPath(path: JSON.ValuePath) {
    return this.#stringPath === path.join(ANALYZER_PATH_SEPARATOR);
  }
}
