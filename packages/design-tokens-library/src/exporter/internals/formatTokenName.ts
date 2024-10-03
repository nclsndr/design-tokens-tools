import { Array as EArray, Option } from 'effect';
import { ALIAS_PATH_SEPARATOR, Json } from 'design-tokens-format-module';
import mustache from 'mustache';

import { pathToCase, stringToCase } from './toCase.js';

import { TokenNameFormatOptions } from './FormatOptions.js';

/**
 * Format token name for export
 * @param path
 * @param format
 */
export function formatTokenName(
  path: Json.ValuePath,
  format: TokenNameFormatOptions | undefined,
): string {
  if (format?.template !== undefined && format?.joinWith !== undefined) {
    throw new Error(
      'Cannot use both `template` and `joinWith` options to format token name',
    );
  }

  // Mustache template
  if (format?.template !== undefined) {
    const head = path.slice(0, -1);
    const headLength = head.length;
    const view = {
      name: Option.getOrUndefined(EArray.last(path)),
      groups: head,
      group: {
        first: head[0],
        second: head[1],
        third: head[2],
        fourth: head[3],
        fifth: head[4],
        sixth: head[5],
      },
      parent: {
        first: head[headLength - 1],
        second: head[headLength - 2],
        third: head[headLength - 3],
        fourth: head[headLength - 4],
        fifth: head[headLength - 5],
        sixth: head[headLength - 6],
      },
    };
    return stringToCase(mustache.render(format.template, view), format?.toCase);
  }

  if (format?.joinWith === undefined) {
    if (format?.toCase === undefined) {
      return path.join(ALIAS_PATH_SEPARATOR);
    }
    // Join before change case
    return stringToCase(path.join(' '), format?.toCase);
  }

  // Join after change case on each string
  return pathToCase(path, format?.toCase).join(
    format?.joinWith ?? ALIAS_PATH_SEPARATOR,
  );
}
