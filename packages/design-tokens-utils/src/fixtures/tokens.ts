import {
  CubicBezier,
  Transition,
  Dimension,
  Gradient,
  Color,
  Number,
  FontWeight,
  FontFamily,
  Border,
  Duration,
  Typography,
  StrokeStyle,
  Shadow,
} from 'design-tokens-format-module';

export const borderToken: Border.Token = {
  $type: 'border',
  $value: {
    color: '#676767',
    style: 'solid',
    width: '1px',
  },
};
export const colorToken: Color.Token = {
  $type: 'color',
  $value: '#a82222',
};
export const cubicBezierToken: CubicBezier.Token = {
  $type: 'cubicBezier',
  $value: [0, 1, 1, 0],
};
export const dimensionToken: Dimension.Token = {
  $type: 'dimension',
  $value: '12px',
};
export const durationToken: Duration.Token = {
  $type: 'duration',
  $value: '1ms',
};
export const fontFamilyToken: FontFamily.Token = {
  $type: 'fontFamily',
  $value: 'Arial',
};
export const stringFontWeightToken: FontWeight.Token = {
  $type: 'fontWeight',
  $value: 'bold',
};
export const numberFontWeightToken: FontWeight.Token = {
  $type: 'fontWeight',
  $value: 700,
};
export const gradientToken: Gradient.Token = {
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
export const numberToken: Number.Token = {
  $type: 'number',
  $value: 12,
};
export const shadowToken: Shadow.Token = {
  $type: 'shadow',
  $value: {
    color: '#000000',
    offsetX: '1px',
    offsetY: '2px',
    blur: '3px',
    spread: '4px',
  },
};
export const strokeStyleToken: StrokeStyle.Token = {
  $type: 'strokeStyle',
  $value: 'solid',
};
export const transitionToken: Transition.Token = {
  $type: 'transition',
  $value: {
    duration: '100ms',
    delay: '0ms',
    timingFunction: [0, 0.1, 0.7, 0.5],
  },
};
export const typographyToken: Typography.Token = {
  $type: 'typography',
  $value: {
    fontFamily: 'Arial',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    lineHeight: 1.5,
  },
};
