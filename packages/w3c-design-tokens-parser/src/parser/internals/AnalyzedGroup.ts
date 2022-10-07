import { TokenTypeName } from '../../definitions/tokenTypes.js';
import { JSONValuePath } from '../../definitions/JSONDefinitions.js';

export type AnalyzedGroup = {
  path: JSONValuePath;
  childrenCount: number;
  tokenType: TokenTypeName | undefined;
  description: string | undefined;
  extensions: Record<string, any> | undefined;
};
