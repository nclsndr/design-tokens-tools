import { ALIAS_PATH_SEPARATOR, type Json } from 'design-tokens-format-module';
import { JSONPath } from '../utils/JSONPath.js';

export class TreeNode {
  #id: string;
  #arrayPath: Json.ValuePath;
  #stringPath: string;
  #description: string | undefined;
  #extensions: Record<string, any> | undefined;

  constructor(
    id: string,
    path: Json.ValuePath,
    description?: string,
    extensions?: Record<string, any>,
  ) {
    this.#id = id;
    this.#arrayPath = path;
    this.#description = description;
    this.#extensions = extensions;

    this.#stringPath = path.join(ALIAS_PATH_SEPARATOR);
  }

  get id() {
    return this.#id;
  }
  get path(): Json.ValuePath {
    return this.#arrayPath;
  }
  get name() {
    return this.#arrayPath.at(-1) ?? '';
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

  matchPath(path: Json.ValuePath) {
    return this.#stringPath === path.join(ALIAS_PATH_SEPARATOR);
  }

  equalsPath(path: Json.ValuePath) {
    return this.#stringPath === path.join(ALIAS_PATH_SEPARATOR);
  }

  equalsJSONPath(path: JSONPath) {
    return path.equalsStringPath(this.#stringPath);
  }

  equalsStringPath(path: string) {
    return this.#stringPath === path;
  }
}
