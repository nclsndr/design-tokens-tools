import { ALIAS_PATH_SEPARATOR, type Json } from 'design-tokens-format-module';
import { JSONPath } from '@nclsndr/design-tokens-utils';

export class TreeNode {
  #id: string;
  #path: JSONPath;
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
    this.#path = JSONPath.fromJSONValuePath(path);
    this.#description = description;
    this.#extensions = extensions;

    this.#stringPath = path.join(ALIAS_PATH_SEPARATOR);
  }

  get id() {
    return this.#id;
  }
  get path(): Json.ValuePath {
    return this.#path.array;
  }
  get name() {
    return this.#path.last;
  }
  get stringPath() {
    return this.#path.string;
  }
  get description() {
    return this.#description;
  }
  get extensions() {
    return this.#extensions;
  }

  get isRoot() {
    return this.#path.isRoot;
  }

  // TODO @Nico: clean up methods below

  matchPath(path: Json.ValuePath) {
    return this.#path.string === path.join(ALIAS_PATH_SEPARATOR);
  }

  equalsPath(path: Json.ValuePath) {
    return this.#path.equals(path);
  }

  equalsJSONPath(path: JSONPath) {
    return path.equalsJSONPath(this.#path);
  }

  equalsStringPath(path: string) {
    return this.#path.equalsStringPath(path);
  }

  toDesignTokenAliasPath() {
    return this.#path.toDesignTokenAliasPath();
  }
}
