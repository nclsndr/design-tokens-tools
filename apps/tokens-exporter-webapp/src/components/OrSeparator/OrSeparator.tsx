import { Text } from '@radix-ui/themes';

import css from './orSeparator.module.css';

export function OrSeparator() {
  return (
    <div className={css.box}>
      <div className={css.separator} />
      <Text as="p" color="gray" size="1">
        OR
      </Text>
      <div className={css.separator} />
    </div>
  );
}
