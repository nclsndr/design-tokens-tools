import { TokensLibrary } from '../TokensLibrary.js';

export type ExporterOutput = Array<{
  type: 'file';
  path: string;
  content: string;
}>;

export type Exporter = (lib: TokensLibrary) => ExporterOutput;

export type MakeExporter<O extends Record<any, any>> = (
  options?: O,
) => Exporter;
