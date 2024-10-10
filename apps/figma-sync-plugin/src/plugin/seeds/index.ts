import { VariableResolvedDataType } from '@figma/plugin-typings/plugin-api-standalone';

export const collectionsAndVariables: Array<{
  collectionName: string;
  variables: Array<{
    name: string;
    resolvedType: VariableResolvedDataType;
    modes: Record<string, any>;
  }>;
}> = [
  {
    collectionName: 'Base (single mode)',
    variables: [
      {
        name: 'Spacing/1',
        resolvedType: 'FLOAT',
        modes: { base: 8 },
      },
      {
        name: 'Spacing/2',
        resolvedType: 'FLOAT',
        modes: { base: 16 },
      },
    ],
  },
  {
    collectionName: 'Color scheme (light/dark)',
    variables: [
      {
        name: 'Gray/1',
        resolvedType: 'COLOR',
        modes: { light: '#fcfcfc', dark: '#111111' },
      },
      {
        name: 'Blue/11',
        resolvedType: 'COLOR',
        modes: {
          light: '#0d74ce',
          dark: '#70b8ff',
        },
      },
    ],
  },
];

const gray = {
  gray1: '#fcfcfc',
  gray2: '#f9f9f9',
  gray3: '#f0f0f0',
  gray4: '#e8e8e8',
  gray5: '#e0e0e0',
  gray6: '#d9d9d9',
  gray7: '#cecece',
  gray8: '#bbbbbb',
  gray9: '#8d8d8d',
  gray10: '#838383',
  gray11: '#646464',
  gray12: '#202020',
};
const grayDark = {
  gray1: '#111111',
  gray2: '#191919',
  gray3: '#222222',
  gray4: '#2a2a2a',
  gray5: '#313131',
  gray6: '#3a3a3a',
  gray7: '#484848',
  gray8: '#606060',
  gray9: '#6e6e6e',
  gray10: '#7b7b7b',
  gray11: '#b4b4b4',
  gray12: '#eeeeee',
};

const blueLight = {
  blue1: '#fbfdff',
  blue2: '#f4faff',
  blue3: '#e6f4fe',
  blue4: '#d5efff',
  blue5: '#c2e5ff',
  blue6: '#acd8fc',
  blue7: '#8ec8f6',
  blue8: '#5eb1ef',
  blue9: '#0090ff',
  blue10: '#0588f0',
  blue11: '#0d74ce',
  blue12: '#113264',
};
const blueDark = {
  blue1: '#0d1520',
  blue2: '#111927',
  blue3: '#0d2847',
  blue4: '#003362',
  blue5: '#004074',
  blue6: '#104d87',
  blue7: '#205d9e',
  blue8: '#2870bd',
  blue9: '#0090ff',
  blue10: '#3b9eff',
  blue11: '#70b8ff',
  blue12: '#c2e6ff',
};
