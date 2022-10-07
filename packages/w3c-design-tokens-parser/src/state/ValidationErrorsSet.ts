import { ValidationError } from '../utils/validationError.js';

export class ValidationErrorsSet {
  #errors: Array<ValidationError> = [];

  get nodes() {
    return this.#errors.slice();
  }

  register(...errors: Array<ValidationError>) {
    this.#errors.push(...errors);
  }
}
