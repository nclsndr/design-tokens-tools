import { Option } from 'effect';
import {
  Json as JSONTypes,
  JSONTokenTree,
  TokenTypeName,
} from 'design-tokens-format-module';
import { deepSetJSONValue } from '@nclsndr/design-tokens-utils';

import { ReferencesSet } from '../token/ReferencesSet.js';
import { TreeNodesMap } from './TreeNodesMap.js';
import { TokenState } from '../token/TokenState.js';
import { GroupState } from '../group/GroupState.js';
import { ValidationErrorsSet } from './ValidationErrorsSet.js';
import { matchTokenStateAgainstSelectToken } from '../../utils/matchTokenStateAgainstSelectToken.js';
import { SelectToken } from '../../exporter/internals/Select.js';
/**
 * The state for a token tree.
 * Used to query / filter the tree nodes.
 */
export class TreeState {
  #name: string;

  #tokens: TreeNodesMap<TokenState>;
  #groups: TreeNodesMap<GroupState>;
  #references: ReferencesSet;

  #validationErrors: ValidationErrorsSet;

  constructor(options: { name: string }) {
    this.#name = options.name;

    this.#tokens = new TreeNodesMap();
    this.#groups = new TreeNodesMap();
    this.#references = new ReferencesSet(this);
    this.#validationErrors = new ValidationErrorsSet();
  }

  /**
   * Access the tree name.
   */
  get treeName() {
    return this.#name;
  }

  /**
   * Access the token TreeNodesMap instance.
   * @internal
   */
  get tokenStates() {
    return this.#tokens;
  }

  /**
   * Access the group TreeNodesMap instance.
   * @internal
   */
  get groupStates() {
    return this.#groups;
  }

  /**
   * Access the referencesSet instance.
   * @internal
   */
  get references() {
    return this.#references;
  }

  /**
   * Access the validationErrorsSet.
   */
  get validationErrors() {
    return this.#validationErrors;
  }

  /**
   * Get a token by its path.
   * @param path - The path of the targeted token.
   */
  getTokenStateByPath(path: JSONTypes.ValuePath) {
    return this.#tokens.getOneByPath(path);
  }

  /**
   * Get a token by its path while validating its type.
   * @param type - The token type of the targeted token.
   * @param path - The path of the targeted token.
   */
  getTokenOfTypeByPath<T extends TokenTypeName>(
    type: T,
    path: JSONTypes.ValuePath,
  ): Option.Option<TokenState<T>> {
    // @ts-expect-error - filter can't infer the narrowed type
    return Option.filter(
      this.#tokens.getOneByPath(path),
      (tokenState) => tokenState.type === type,
    );
  }

  /**
   * Get all tokens matching the select options.
   * @param options
   * @param options.tokenTypes - The token types to keep.
   * @param options.where - An array of array based path to select from.
   */
  selectTokenStates(options: SelectToken) {
    return this.#tokens.nodes.reduce<Array<TokenState>>((acc, tokenState) => {
      if (matchTokenStateAgainstSelectToken(tokenState, options)) {
        acc.push(tokenState);
      }
      return acc;
    }, []);
  }

  toJSON() {
    const root = this.#groups.nodes.find((g) => g.isRoot);
    const acc: JSONTokenTree = root ? root.toJSON() : {};

    for (const group of this.#groups.nodes) {
      if (group.path.length === 0) continue;
      deepSetJSONValue(acc, group.path, group.toJSON());
    }
    for (const token of this.#tokens.nodes) {
      deepSetJSONValue(acc, token.path, token.toJSON());
    }

    return acc;
  }
}
