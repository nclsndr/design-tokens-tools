import { Json as JSONTypes, TokenTypeName } from 'design-tokens-format-module';
import { Option } from 'effect';

import { ReferencesSet } from './ReferencesSet.js';
import { TreeNodesMap } from './TreeNodesMap.js';
import { TokenState } from './TokenState.js';
import { GroupState } from './GroupState.js';
import { ValidationErrorsSet } from './ValidationErrorsSet.js';
import { matchTokenStateAgainstSelectToken } from './utils/matchTokenStateAgainstSelectToken.js';
import { SelectToken } from '../library/internals/Select.js';

export class TreeState {
  #tokens: TreeNodesMap<TokenState>;
  #groups: TreeNodesMap<GroupState>;
  #references: ReferencesSet;

  #validationErrors: ValidationErrorsSet;

  constructor() {
    this.#tokens = new TreeNodesMap();
    this.#groups = new TreeNodesMap();
    this.#references = new ReferencesSet(this);
    this.#validationErrors = new ValidationErrorsSet();
  }

  get tokenStates() {
    return this.#tokens;
  }
  get groupStates() {
    return this.#groups;
  }
  get references() {
    return this.#references;
  }
  get validationErrors() {
    return this.#validationErrors;
  }

  getTokenByPath(path: JSONTypes.ValuePath) {
    return this.#tokens.getOneByPath(path);
  }

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

  selectTokens(options: SelectToken) {
    return this.#tokens.nodes.reduce<Array<TokenState>>((acc, tokenState) => {
      if (matchTokenStateAgainstSelectToken(tokenState, options)) {
        acc.push(tokenState);
      }
      return acc;
    }, []);
  }
}
