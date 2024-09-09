import { type JSON, TokenTypeName } from 'design-tokens-format-module';

export type AnalyzedGroup = {
  id: string;
  path: JSON.ValuePath;
  childrenCount: number;
  tokenType: TokenTypeName | undefined;
  description: string | undefined;
  extensions: Record<string, any> | undefined;
};
