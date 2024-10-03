import { TokenState } from '../state/token/TokenState.js';
import { TokenTypeName } from 'design-tokens-format-module';

const a = [
  'number',
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'strokeStyle',
  'border',
  'transition',
  'shadow',
  'gradient',
  'typography',
];

type MatchTokenStateCallback<T extends TokenTypeName, R> = (
  tokenState: TokenState<T>,
) => R;

export function matchTokenState<R>(
  tokenState: TokenState,
  callbacks: {
    onNumber: MatchTokenStateCallback<'number', R>;
    onColor: MatchTokenStateCallback<'color', R>;
    onDimension: MatchTokenStateCallback<'dimension', R>;
    onFontFamily: MatchTokenStateCallback<'fontFamily', R>;
    onFontWeight: MatchTokenStateCallback<'fontWeight', R>;
    onDuration: MatchTokenStateCallback<'duration', R>;
    onCubicBezier: MatchTokenStateCallback<'cubicBezier', R>;
    onStrokeStyle: MatchTokenStateCallback<'strokeStyle', R>;
    onBorder: MatchTokenStateCallback<'border', R>;
    onTransition: MatchTokenStateCallback<'transition', R>;
    onShadow: MatchTokenStateCallback<'shadow', R>;
    onGradient: MatchTokenStateCallback<'gradient', R>;
    onTypography: MatchTokenStateCallback<'typography', R>;
  },
) {
  switch (tokenState.type) {
    case 'number':
      return callbacks.onNumber(tokenState as TokenState<'number'>);
    case 'color':
      return callbacks.onColor(tokenState as TokenState<'color'>);
    case 'dimension':
      return callbacks.onDimension(tokenState as TokenState<'dimension'>);
    case 'fontFamily':
      return callbacks.onFontFamily(tokenState as TokenState<'fontFamily'>);
    case 'fontWeight':
      return callbacks.onFontWeight(tokenState as TokenState<'fontWeight'>);
    case 'duration':
      return callbacks.onDuration(tokenState as TokenState<'duration'>);
    case 'cubicBezier':
      return callbacks.onCubicBezier(tokenState as TokenState<'cubicBezier'>);
    case 'strokeStyle':
      return callbacks.onStrokeStyle(tokenState as TokenState<'strokeStyle'>);
    case 'border':
      return callbacks.onBorder(tokenState as TokenState<'border'>);
    case 'transition':
      return callbacks.onTransition(tokenState as TokenState<'transition'>);
    case 'shadow':
      return callbacks.onShadow(tokenState as TokenState<'shadow'>);
    case 'gradient':
      return callbacks.onGradient(tokenState as TokenState<'gradient'>);
    case 'typography':
      return callbacks.onTypography(tokenState as TokenState<'typography'>);
  }
}
