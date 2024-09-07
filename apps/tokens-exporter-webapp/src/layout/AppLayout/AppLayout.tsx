import { useAtom } from 'jotai';
import classnames from 'classnames';

import { LayoutState, layoutAtom } from '../../store/layout.ts';

import css from './AppLayout.module.css';

function makeLayoutClassName(layout: LayoutState) {
  switch (layout) {
    case 'init':
      return css.initLayout;
    case 'input':
      return css.inputLayout;
    case 'transform':
      return css.transformLayout;
    case 'output':
      return css.outputLayout;
    default: {
      return '';
    }
  }
}

export function AppLayout({
  inputComponent,
  transformComponent,
  outputComponent,
}: {
  inputComponent: React.ReactNode;
  transformComponent: React.ReactNode;
  outputComponent: React.ReactNode;
}) {
  const [layoutName] = useAtom(layoutAtom);

  return (
    <div
      className={classnames(
        'rt-Grid',
        css.layout,
        makeLayoutClassName(layoutName),
      )}
    >
      {inputComponent}
      {transformComponent}
      {outputComponent}
    </div>
  );
}
