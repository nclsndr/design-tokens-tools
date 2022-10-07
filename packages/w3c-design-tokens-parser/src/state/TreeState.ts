import { ReferencesSet } from './ReferencesSet.js';
import { TreeNodesSet } from './TreeNodesSet.js';
import { TokenState } from './TokenState.js';
import { GroupState } from './GroupState.js';
import { ValidationErrorsSet } from './ValidationErrorsSet.js';

export class TreeState {
  #tokens: TreeNodesSet<TokenState>;
  #groups: TreeNodesSet<GroupState>;
  #references: ReferencesSet;

  #validationErrors: ValidationErrorsSet;

  constructor() {
    this.#tokens = new TreeNodesSet();
    this.#groups = new TreeNodesSet();
    this.#references = new ReferencesSet();
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
