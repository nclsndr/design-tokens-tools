import { ReferencesSet } from './ReferencesSet.js';
import { TreeNodesMap } from './TreeNodesMap.js';
import { TokenState } from './TokenState.js';
import { GroupState } from './GroupState.js';
import { ValidationErrorsSet } from './ValidationErrorsSet.js';

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
}
