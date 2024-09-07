import * as React from 'react';
import classNames from 'classnames';

import css from './TopBottomColumn.module.css';

export const TopBottomColumn = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    state?: 'normal' | 'expanded';
  }
>(({ children, state }, ref) => {
  return (
    <div
      ref={ref}
      className={classNames(
        css.column,
        state === 'expanded' ? css.columnExpanded : css.columnNormal,
      )}
    >
      {children}
    </div>
  );
});
