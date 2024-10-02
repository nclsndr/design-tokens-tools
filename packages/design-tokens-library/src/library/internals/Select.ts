import { TokenTypeName } from 'design-tokens-format-module';

export type SelectToken = {
  tokenTypes?: Array<TokenTypeName>;
  where?: Array<Array<string>>;
};
export type SelectSet = {
  name: string;
} & SelectToken;
export type SelectTheme = {
  name: string;
  mode: string;
} & SelectToken;
export type SelectInLibrary =
  | ({ type: 'set' } & SelectSet)
  | ({ type: 'theme' } & SelectTheme);
