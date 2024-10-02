import {
  TokensLibrary,
  SourceTokenSet,
  SourceTheme,
} from './library/TokensLibrary.js';

export function makeTokensLibrary({
  sets,
  themes,
}: {
  sets: Array<SourceTokenSet>;
  themes?: Array<SourceTheme>;
}) {
  return new TokensLibrary(sets ?? [], themes ?? []);
}
