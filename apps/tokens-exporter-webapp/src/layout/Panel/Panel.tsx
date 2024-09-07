import css from './Panel.module.css';
import classNames from 'classnames';

export function Panel({
  header,
  children,
  hasBorder,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  hasBorder?: boolean;
}) {
  return (
    <div className={classNames(css.panel, hasBorder ? css.withBorder : '')}>
      <div className={css.p_header}>{header}</div>
      {children}
    </div>
  );
}
