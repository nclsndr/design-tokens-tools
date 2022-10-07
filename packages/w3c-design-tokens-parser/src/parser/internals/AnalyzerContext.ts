import { JSONValuePath } from '../../definitions/JSONDefinitions.js';

export const ANALYZER_PATH_SEPARATOR = '|';

export type AnalyzerContext = {
  varName: string;
  path: JSONValuePath;
  valuePath?: JSONValuePath | undefined;
  nodeKey?: '$type' | '$value' | '$description' | '$extensions';
};
