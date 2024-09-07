import { atom } from 'jotai';

export type LayoutState = 'init' | 'input' | 'transform' | 'output';
export const layoutAtom = atom<LayoutState>('init');
