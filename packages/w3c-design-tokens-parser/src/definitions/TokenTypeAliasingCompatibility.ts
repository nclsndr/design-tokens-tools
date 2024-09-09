export type TokenTypeAliasingCompatibilityMap = {
  color: 'color';
  dimension: 'dimension';
  fontFamily: 'fontFamily';
  fontWeight: 'fontWeight';
  duration: 'duration';
  cubicBezier: 'cubicBezier';
  number: 'number';
  strokeStyle: 'strokeStyle';
  'strokeStyle.dashArray.0': 'dimension';
  border: 'border';
  'border.width': 'dimension';
  'border.color': 'color';
  'border.style': 'strokeStyle';
  transition: 'transition';
  'transition.duration': 'duration';
  'transition.delay': 'duration';
  'transition.timingFunction': 'cubicBezier';
  shadow: 'shadow';
  'shadow.color': 'color';
  'shadow.offsetX': 'dimension';
  'shadow.offsetY': 'dimension';
  'shadow.blur': 'dimension';
  'shadow.spread': 'dimension';
  gradient: 'gradient';
  'gradient.0': 'gradient';
  'gradient.0.color': 'color';
  typography: 'typography';
  'typography.fontFamily': 'fontFamily';
  'typography.fontWeight': 'fontWeight';
  'typography.fontSize': 'dimension';
  'typography.letterSpacing': 'dimension';
  'typography.lineHeight': 'number';
};

export type PickTokenTypeAliasingCompatibilityEntry<T extends string> =
  T extends keyof TokenTypeAliasingCompatibilityMap
    ? TokenTypeAliasingCompatibilityMap[T]
    : never;
