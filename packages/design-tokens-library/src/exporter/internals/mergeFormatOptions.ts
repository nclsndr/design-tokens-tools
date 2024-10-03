import { FormatOptions } from './FormatOptions.js';

export function mergeFormatOptions(
  origin: FormatOptions | undefined,
  target: FormatOptions | undefined,
): FormatOptions {
  return {
    token: {
      ...origin?.token,
      ...target?.token,
      name: {
        ...origin?.token?.name,
        ...target?.token?.name,
      },
      value: {
        ...origin?.token?.value,
        ...target?.token?.value,
      },
    },
  };
}
