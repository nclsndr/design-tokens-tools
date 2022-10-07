import { StringToken } from '../../src/definitions/tokenTypes/string';
import { CubicBezierToken } from '../../src/definitions/tokenTypes/cubicBezier';
import { TransitionToken } from '../../src/definitions/tokenTypes/transition';
import { DimensionToken } from '../../src/definitions/tokenTypes/dimension';
import { GradientToken } from '../../src/definitions/tokenTypes/gradient';
import { ColorToken } from '../../src/definitions/tokenTypes/color';
import { NumberToken } from '../../src/definitions/tokenTypes/number';
import { FontWeightToken } from '../../src/definitions/tokenTypes/fontWeight';
import { FontFamilyToken } from '../../src/definitions/tokenTypes/fontFamily';
import { BorderToken } from '../../src/definitions/tokenTypes/border';
import { DurationToken } from '../../src/definitions/tokenTypes/duration';
import { TypographyToken } from '../../src/definitions/tokenTypes/typography';
import { StrokeStyleToken } from '../../src/definitions/tokenTypes/strokeStyle';
import { ShadowToken } from '../../src/definitions/tokenTypes/shadow';

export const borderToken: BorderToken = {
  $type: 'border',
  $value: {
    color: '#676767',
    style: 'solid',
    width: '1px',
  },
};
export const colorToken: ColorToken = {
  $type: 'color',
  $value: '#a82222',
};
export const cubicBezierToken: CubicBezierToken = {
  $type: 'cubicBezier',
  $value: [0, 1, 1, 0],
};
export const dimensionToken: DimensionToken = {
  $type: 'dimension',
  $value: '12px',
};
export const durationToken: DurationToken = {
  $type: 'duration',
  $value: '1s',
};
export const fontFamilyToken: FontFamilyToken = {
  $type: 'fontFamily',
  $value: 'Arial',
};
export const stringFontWeightToken: FontWeightToken = {
  $type: 'fontWeight',
  $value: 'bold',
};
export const numberFontWeightToken: FontWeightToken = {
  $type: 'fontWeight',
  $value: 700,
};
export const gradientToken: GradientToken = {
  $type: 'gradient',
  $value: [
    {
      color: '#000000',
      position: 0,
    },
    {
      color: '#ffffff',
      position: 1,
    },
  ],
};
export const numberToken: NumberToken = {
  $type: 'number',
  $value: 12,
};
export const shadowToken: ShadowToken = {
  $type: 'shadow',
  $value: {
    color: '#000000',
    offsetX: '1px',
    offsetY: '2px',
    blur: '3px',
    spread: '4px',
  },
};
export const stringToken: StringToken = {
  $type: 'string',
  $value: 'hello',
};
export const strokeStyleToken: StrokeStyleToken = {
  $type: 'strokeStyle',
  $value: 'solid',
};
export const transitionToken: TransitionToken = {
  $type: 'transition',
  $value: {
    duration: '1s',
    delay: '0s',
    timingFunction: [0, 0.1, 0.7, 0.5],
  },
};
export const typographyToken: TypographyToken = {
  $type: 'typography',
  $value: {
    fontFamily: 'Arial',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    lineHeight: 1.5,
  },
};
