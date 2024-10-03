import { Either } from 'effect';

export type RegistryEntry = {
  fileName: string;
  scope: string;
  tokenStringPath: string;
  CSSTokenPath: string;
};

export class ExportRegistry {
  #mapping: Map<
    // tokenStringPath
    string,
    RegistryEntry
  > = new Map();
  #errors: Array<string> = [];

  get errors() {
    return this.#errors;
  }

  add(entry: {
    fileName: string;
    scope: string;
    tokenStringPath: string;
    CSSTokenPath: string;
  }) {
    const maybeFoundEntry = this.#mapping.get(entry.tokenStringPath);
    if (maybeFoundEntry === undefined) {
      this.#mapping.set(entry.tokenStringPath, entry);
    } else if (maybeFoundEntry.CSSTokenPath !== entry.CSSTokenPath) {
      this.#errors.push(
        `Token "${entry.tokenStringPath}" is already declared using the var name "${maybeFoundEntry.CSSTokenPath}" from scope "${maybeFoundEntry.scope}" file "${maybeFoundEntry.fileName}". Found "${entry.CSSTokenPath}" from scope "${entry.scope}" file "${entry.fileName}".`,
      );
    }
  }

  getEntryByStringPath(tokenStringPath: string) {
    const maybeEntry = this.#mapping.get(tokenStringPath);
    if (maybeEntry) return Either.right(maybeEntry);
    else
      return Either.left(
        `Token "${tokenStringPath}" not found in the registry.`,
      );
  }
}
