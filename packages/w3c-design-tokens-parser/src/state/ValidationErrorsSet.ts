import { ValidationError } from '../utils/validationError.js';

export class ValidationErrorsSet {
  #errors: Array<ValidationError> = [];

  get nodes() {
    return this.#errors.slice();
  }

  get size() {
    return this.#errors.length;
  }

  add(...errors: Array<ValidationError>) {
    this.#errors.push(...errors);
  }

  toString() {
    return this.#errors.map((error) => error.toString()).join('\n');
  }
}
