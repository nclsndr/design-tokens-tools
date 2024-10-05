import { TokensLibraryState } from '../../state/library/TokensLibraryState.js';

export type ExporterOutput = Array<{
  type: 'file';
  path: string;
  content: string;
}>;

export type Exporter = (lib: TokensLibraryState) => ExporterOutput;

export type ExporterFactory<O extends Record<any, any>> = (
  options: O,
) => Exporter;
