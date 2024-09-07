// import * as React from 'react';
import type { Utils } from '@nclsndr/w3c-design-tokens-parser';
import { Code, Flex, Text } from '@radix-ui/themes';

import { errorColor } from '../../style.ts';
import css from './ValidationError.module.css';

export function ValidationError({
  error,
}: {
  error: ReturnType<Utils.ValidationError['toJSON']>;
}) {
  return (
    <Flex
      data-accent-color="ruby"
      className={css.box}
      direction="column"
      gap="1"
      py="3"
      px="4"
    >
      <Code size="1" className="path" color="gray" variant="ghost">
        {error.treePath.join('.')}
      </Code>
      <Text size="2" className="message" color={errorColor} weight="medium">
        {error.message}
      </Text>
    </Flex>
  );
}
