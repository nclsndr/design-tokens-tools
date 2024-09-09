import * as colors from './radix-colors.js';

export const radixColorTokens = Object.entries(colors).reduce(
  (acc, [groupName, values]) => {
    acc[groupName] = Object.entries(values).reduce((acc, [name, value]) => {
      acc[name] = {
        $value: value,
      };
      return acc;
    }, {});
    return acc;
  },
  {
    $type: 'color',
  },
);

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const aliasesToRadixColors = Object.entries(colors).reduce(
  (acc, [groupName, values]) => {
    acc[groupName] = Object.entries(values).reduce((acc, [name, value]) => {
      acc[`aliasOf${capitalize(name)}`] = {
        $value: `{${groupName}.${name}}`,
      };
      return acc;
    }, {});
    return acc;
  },
  {},
);
