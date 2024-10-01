import { type Json, TokenTypeName } from 'design-tokens-format-module';

export type AnalyzedGroup = {
  id: string;
  path: Json.ValuePath;
  childrenCount: number;
  tokenType: TokenTypeName | undefined;
  description: string | undefined;
  extensions: Record<string, any> | undefined;
};
