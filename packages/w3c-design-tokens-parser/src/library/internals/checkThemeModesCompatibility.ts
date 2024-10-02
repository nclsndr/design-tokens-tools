import { TreeState } from '../../state/TreeState.js';
import { Option } from 'effect';

export function checkThemeModesCompatibility(
  modes: Array<{ name: string; treeState: TreeState }>,
): Option.Option<string> {
  const modesPaths = modes.map(({ name, treeState }) => ({
    name,
    paths: treeState.tokenStates.nodes.flatMap(({ stringPath }) => stringPath),
  }));

  const allPaths = new Set(modesPaths.flatMap(({ paths }) => paths));

  const missing: Array<[string, string]> = [];
  for (const m of modesPaths) {
    for (const path of allPaths) {
      if (!m.paths.includes(path)) {
        missing.push([m.name, path]);
      }
    }
  }

  if (missing.length > 0) {
    const errorsByMode = missing.reduce<Record<string, Array<string>>>(
      (acc, [mode, path]) => {
        if (!acc[mode]) {
          acc[mode] = [];
        }
        acc[mode].push(path);
        return acc;
      },
      {},
    );

    const errorsByModeEntries = Object.entries(errorsByMode);

    const stats = errorsByModeEntries.reduce<{
      longestModeLength: number;
      longestPathLength: number;
    }>(
      (acc, [mode, paths]) => {
        acc.longestModeLength = Math.max(acc.longestModeLength, mode.length);
        acc.longestPathLength = Math.max(
          acc.longestPathLength,
          paths.reduce((acc, path) => Math.max(acc, path.length), 0),
        );
        return acc;
      },
      {
        longestModeLength: 0,
        longestPathLength: 0,
      },
    );

    const formatted = errorsByModeEntries.map(([mode, paths]) => {
      const modePadding = ' '.repeat(stats.longestModeLength - mode.length);
      return `${mode}${modePadding} -> ${paths.join(`\n${' '.repeat(stats.longestModeLength + 4)}`)}`;
    });

    return Option.some(
      `The following paths are missing:\n${formatted.join('\n')}`,
    );
  }
  return Option.none();
}
