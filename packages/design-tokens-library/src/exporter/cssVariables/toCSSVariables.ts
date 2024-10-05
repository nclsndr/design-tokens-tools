import { tokenStateToCSS } from './tokenStateToCSS.js';
import { FormatOptions } from '../internals/FormatOptions.js';
import { ExporterFactory, ExporterOutput } from '../internals/Exporter.js';
import { SelectInLibrary } from '../internals/Select.js';
import { mergeFormatOptions } from '../internals/mergeFormatOptions.js';
import { tokenStatesToJSON } from '../../utils/tokenStatesToJSON.js';
import { mergeJSONTrees } from '@nclsndr/design-tokens-utils';
import { Either } from 'effect';
import { buildTreeState } from '../../state/buildTreeState.js';
import { formatTokenName } from '../internals/formatTokenName.js';
import { ExportRegistry } from '../internals/ExportRegistry.js';

export type ToCSSVariablesOptions = {
  files: Array<{
    name: string;
    content: Array<{
      scope: string;
      with: Array<SelectInLibrary & { format?: FormatOptions }>;
    }>;
    format?: FormatOptions;
  }>;
  format?: FormatOptions;
};

export const toCSSVariables: ExporterFactory<ToCSSVariablesOptions> =
  (options) => (library) => {
    const registry = new ExportRegistry();

    const files = options.files.map((file) => {
      const fileFormatOptions = mergeFormatOptions(
        options?.format,
        file.format,
      );

      const css = file.content
        .flatMap((content) => {
          const scopeJsonTree = content.with
            .map(({ format, ...rest }) => {
              const tokenStates = library.selectTokens([rest]);
              return {
                tokenStates,
                jsonTree: tokenStatesToJSON(tokenStates),
                format: mergeFormatOptions(fileFormatOptions, format),
              };
            })
            .reduce<ReturnType<typeof mergeJSONTrees>>(
              (acc, { tokenStates, jsonTree, format }) => {
                // register the first occurrence of the token within the registry
                for (const ts of tokenStates) {
                  registry.add({
                    fileName: file.name,
                    scope: content.scope,
                    tokenStringPath: ts.stringPath,
                    CSSTokenPath: formatTokenName(
                      ts.path,
                      mergeFormatOptions(fileFormatOptions, format)?.token
                        ?.name,
                    ),
                  });
                }
                // accumulate the json trees from selectTokens
                return Either.flatMap(acc, (ac) =>
                  mergeJSONTrees(ac, jsonTree),
                );
              },
              Either.right({}),
            )
            .pipe(
              Either.match({
                onRight: (jsonTree) => jsonTree,
                onLeft: (error) => {
                  throw new Error(
                    `File "${file.name}" content scope "${content.scope}" merge error:\n  ${error}`,
                  );
                },
              }),
            );

          // Validate the merged tree for the scope
          buildTreeState(scopeJsonTree, {
            name: content.scope,
            throwOnError: true,
          });

          return [
            `${content.scope} {`,
            ...content.with
              .flatMap(({ format, ...rest }) =>
                library.selectTokens([rest]).map((t) => {
                  return tokenStateToCSS(
                    t,
                    mergeFormatOptions(fileFormatOptions, format),
                    {
                      renderAliasValue: (stringPath: string) =>
                        Either.match(
                          registry.getEntryByStringPath(stringPath),
                          {
                            onRight: (entry) => `var(--${entry.CSSTokenPath})`,
                            onLeft: (err) => {
                              throw new Error(err);
                            },
                          },
                        ),
                    },
                  );
                }),
              )
              .filter(
                // filtering unsupported tokens
                (c) => c !== '',
              ),
            `}`,
          ];
        })
        .join('\n');

      return {
        type: 'file',
        path: file.name,
        content: css,
      } satisfies ExporterOutput[number];
    });

    if (registry.errors.length > 0) {
      throw new Error(registry.errors.join('\n'));
    }

    return files;
  };
