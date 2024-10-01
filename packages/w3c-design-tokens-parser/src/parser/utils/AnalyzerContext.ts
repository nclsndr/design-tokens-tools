import { type Json } from 'design-tokens-format-module';

export type AnalyzerContext = {
  varName: string;
  nodeId: string;
  path: Json.ValuePath;
  valuePath?: Json.ValuePath | undefined;
  nodeKey?: '$type' | '$value' | '$description' | '$extensions';
};
