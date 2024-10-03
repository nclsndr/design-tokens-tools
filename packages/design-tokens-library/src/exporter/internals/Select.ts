import { TokenTypeName } from 'design-tokens-format-module';

export type SelectToken = {
  tokenTypes?: Array<TokenTypeName>;
  where?: Array<Array<string>>;
};
export type SelectTree = {
  name: string;
} & SelectToken;
export type SelectCollection = {
  name: string;
  mode: string;
} & SelectToken;
export type SelectInLibrary =
  | ({ type: 'tokenTree' } & SelectTree)
  | ({ type: 'collection' } & SelectCollection);

type tt =
  | {
      type: 'tokenTree';
      name: string;
      tokenTypes?: Array<TokenTypeName>;
      where?: Array<Array<string>>;
    }
  | {
      type: 'collection';
      name: string;
      mode: string;
      tokenTypes?: Array<TokenTypeName>;
      where?: Array<Array<string>>;
    };
