import { TokensLibrary } from '../TokensLibrary.js';
import { tokenStateToCss } from './tokenStateToCss.js';
import { FormatOptions } from '../internals/FormatOptions.js';
import { MakeExporter } from '../internals/Exporter.js';
import { SelectInLibrary } from '../internals/Select.js';

export type ToCssOptions = {
  files: Array<{
    name: string;
    content: Array<{
      scope: string;
      with: Array<SelectInLibrary>;
    }>;
    format?: FormatOptions;
  }>;
  format?: FormatOptions;
};

export const toCssVariables: MakeExporter<ToCssOptions> =
  (options?: ToCssOptions) => (library: TokensLibrary) => {
    const cssFiles = options?.files.map((file) => {
      const content = file.content
        .flatMap((c) => [
          `${c.scope} {`,
          ...library
            .selectTokens(c.with)
            .map((t) => tokenStateToCss(t, file.format ?? options?.format)),
          `}`,
        ])
        .filter(
          // filtering unsupported tokens
          (c) => c !== '',
        )
        .join('\n');

      return {
        type: 'file' as const,
        path: file.name,
        content,
      };
    });
    return cssFiles === undefined ? [] : cssFiles;
  };
