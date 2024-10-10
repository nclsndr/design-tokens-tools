import { Option } from '@swan-io/boxed';

export class Registry<
  Key extends string,
  Source extends { [k in Key]: string }
> {
  readonly #map: Map<string, Source>;
  readonly #array: Array<Source>;

  constructor(
    options: {
      on: Key;
    },
    sources: Array<Source>
  ) {
    this.#array = sources;
    this.#map = new Map(sources.map((source) => [source[options.on], source]));
  }

  get array(): Array<Source> {
    return this.#array;
  }

  getOne(keyValue: string): Source | undefined {
    return this.#map.get(keyValue);
  }

  getOneOption(keyValue: string): Option<Source> {
    const source = this.getOne(keyValue);
    if (!source) {
      return Option.None();
    }
    return Option.Some(source);
  }
}
