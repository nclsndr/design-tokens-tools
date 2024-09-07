import * as React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  ScrollArea,
  Text,
  TextArea,
} from '@radix-ui/themes';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  EnterIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import Editor from '@monaco-editor/react';
import type { Utils } from '@nclsndr/w3c-design-tokens-parser';

import { DropArea } from '../../components/DropArea/DropArea.tsx';
import { OrSeparator } from '../../components/OrSeparator/OrSeparator.tsx';
import { BrowseFilesButton } from '../../components/BrowseFilesButton/BrowseFilesButton.tsx';
import { layoutAtom } from '../../store/layout.ts';
import { stringTokenTreeAtom } from '../../store/stringTokenTree.ts';
import { Panel } from '../Panel/Panel.tsx';
import { parsedTokenTreeAtom } from '../../store/parsedTokenTree.ts';
import { isDarkModeAtom } from '../../store/isDarkMode.ts';
import { TopBottomColumn } from '../TopBottomColumn/TopBottomColumn.tsx';
import { chevronButtonVariant } from '../../style.ts';
import { ValidationError } from '../../components/ValidationError/ValidationError.tsx';

export function CollapsedInputPanel() {
  const setLayout = useSetAtom(layoutAtom);

  function onToggle() {
    setLayout('input');
  }

  return (
    <Flex direction="row" justify="center" align="start" px="4" py="3">
      <IconButton onClick={onToggle} size="2" variant={chevronButtonVariant}>
        <EnterIcon />
      </IconButton>
    </Flex>
  );
}

export function InputPanel() {
  const [layout, setLayout] = useAtom(layoutAtom);
  const [maybeTokenTreeRes] = useAtom(parsedTokenTreeAtom);
  const setInitialTokenTree = useSetAtom(stringTokenTreeAtom);

  const [isErrorDisplayed, setIsErrorDisplayed] = React.useState(false);

  React.useEffect(() => {
    if (maybeTokenTreeRes.isOk()) {
      setLayout('input');
      if (maybeTokenTreeRes.value.getErrors().length === 0) {
        setIsErrorDisplayed(false);
      }
    }
  }, [maybeTokenTreeRes, setLayout]);

  function onFiles(files: Array<File>) {
    if (files.length === 0) return;

    files[0]
      .text()
      .then((text) => {
        setInitialTokenTree(text);
      })
      .catch(() => {});
  }

  function handleIsOpenClick() {
    setIsErrorDisplayed((prev) => !prev);
  }

  return (
    <Panel header={<InputPanelHeader />}>
      {layout === 'init' ? (
        <ScrollArea scrollbars="vertical">
          <InitInputContent onFiles={onFiles} />
        </ScrollArea>
      ) : (
        <TopBottomColumn state={isErrorDisplayed ? 'expanded' : 'normal'}>
          <Flex direction="column">
            <InputEditor size={isErrorDisplayed ? 'medium' : 'large'} />
            <ResetInitStateButton />
          </Flex>
          <ValidationErrors
            isOpen={isErrorDisplayed}
            setIsOpen={handleIsOpenClick}
            errors={maybeTokenTreeRes.match({
              Ok: (tokenTree) =>
                tokenTree.getErrors().map((err) => err.toJSON()),
              Error: () => [],
            })}
          />
        </TopBottomColumn>
      )}
    </Panel>
  );
}

export function InputPanelHeader() {
  const [layout, setLayout] = useAtom(layoutAtom);
  function onToggle() {
    if (layout === 'input') {
      setLayout('transform');
    } else {
      setLayout('input');
    }
  }

  return (
    <Flex
      direction="row"
      gap="4"
      align="center"
      px="5"
      py="3"
      justify="between"
    >
      <Flex direction="row" gap="1" align="center">
        <EnterIcon />
        <Heading size="4" weight="medium">
          Input
        </Heading>
      </Flex>
      {layout !== 'init' && (
        <IconButton onClick={onToggle} size="2" variant={chevronButtonVariant}>
          <ChevronLeftIcon />
        </IconButton>
      )}
    </Flex>
  );
}

export function ValidationErrors({
  isOpen,
  setIsOpen,
  errors,
}: {
  isOpen: boolean;
  setIsOpen: () => void;
  errors: Array<ReturnType<Utils.ValidationError['toJSON']>>;
}) {
  return (
    <Grid rows="56px 1fr">
      <Flex
        direction="row"
        justify="between"
        align="center"
        px="5"
        py="4"
        style={{
          borderTop: '1px solid var(--gray-6)',
          borderBottom: '1px solid var(--gray-6)',
        }}
      >
        <Flex direction="row" gap="3" align="center" justify="center">
          <ExclamationTriangleIcon />
          <Heading size="4" weight="medium">
            Validation errors
          </Heading>
          <Badge color={errors.length > 0 ? 'ruby' : 'jade'}>
            {errors.length}
          </Badge>
        </Flex>
        <IconButton
          disabled={errors.length === 0}
          variant={chevronButtonVariant}
          onClick={setIsOpen}
        >
          {isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </IconButton>
      </Flex>
      {isOpen && errors.length > 0 && (
        <ScrollArea>
          <Flex direction="column" gap="4" p="4">
            {errors.map((err, i) => {
              return <ValidationError key={i} error={err} />;
            })}
          </Flex>
        </ScrollArea>
      )}
    </Grid>
  );
}

export function ResetInitStateButton() {
  const setStringTokenTree = useSetAtom(stringTokenTreeAtom);
  const setLayout = useSetAtom(layoutAtom);

  return (
    <Box pt="3" pb="1" px="4">
      <Button
        size="1"
        variant="ghost"
        onClick={() => {
          setStringTokenTree(undefined);
          setLayout('init');
        }}
      >
        Reset
      </Button>
    </Box>
  );
}

function computeEditorHeight(windowH: number, size: 'medium' | 'large') {
  const columnH =
    windowH -
    // Header height
    56;
  if (size === 'large') {
    return (
      columnH -
      // Reset button height
      40 -
      // Collapsed errors height
      56
    );
  }
  const errorsH = columnH * 0.4;
  return (
    columnH -
    errorsH -
    // Reset button height
    40
  );
}
export function InputEditor({ size }: { size: 'medium' | 'large' }) {
  const [isDarkMode] = useAtom(isDarkModeAtom);
  const [stringTokenTree, setStringTokenTree] = useAtom(stringTokenTreeAtom);

  const [computedSize, setComputedSize] = React.useState<string>('100%');

  React.useEffect(() => {
    setComputedSize(`${computeEditorHeight(window.innerHeight, size)}px`);

    function listener(e: UIEvent) {
      if (e.target) {
        setComputedSize(
          `${computeEditorHeight(
            // @ts-expect-error - UIEvent is too fuzzy
            e.target.innerHeight,
            size,
          )}px`,
        );
      }
    }
    window.addEventListener('resize', listener);
    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [size]);

  function onEditorChange(str: string | undefined) {
    if (str !== undefined) {
      setStringTokenTree(str);
    }
  }

  return (
    <Editor
      theme={isDarkMode ? 'vs-dark' : 'light'}
      defaultLanguage="json"
      defaultValue={stringTokenTree}
      onChange={onEditorChange}
      height={computedSize}
      width={'100%'}
      options={{
        automaticLayout: true,
      }}
    />
  );
}

export function InitInputContent({
  onFiles,
}: {
  onFiles: (files: Array<File>) => void;
}) {
  const [stringTokenTree] = useAtom(stringTokenTreeAtom);
  const [maybeTokenTreeRes] = useAtom(parsedTokenTreeAtom);

  function onChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const file = new File([event.target.value], 'tokens.json');
    onFiles([file]);
  }

  return (
    <Flex direction="column" px="6" pt="9" pb="6" align="center">
      <Flex direction="column" gap="6" maxWidth="280px">
        <DropArea onDroppedFiles={onFiles} />
        <OrSeparator />
        <BrowseFilesButton onSelectedFiles={onFiles} />
        <OrSeparator />
        <Flex direction="column" gap="2">
          <TextArea
            size="3"
            placeholder="Paste your JSON tokens"
            onChange={onChange}
          />
          {stringTokenTree !== undefined && maybeTokenTreeRes.isError() && (
            <Text size="1" style={{ color: 'var(--error-11)' }}>
              {maybeTokenTreeRes.error}
            </Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
