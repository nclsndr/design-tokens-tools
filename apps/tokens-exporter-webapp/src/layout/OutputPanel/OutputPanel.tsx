import { Panel } from '../Panel/Panel.tsx';
import { Code, Flex, Heading, IconButton, ScrollArea } from '@radix-ui/themes';
import { ExitIcon } from '@radix-ui/react-icons';
import { PrimitiveAtom, useAtom, useSetAtom } from 'jotai/index';
import { layoutAtom } from '../../store/layout.ts';
import { chevronButtonVariant } from '../../style.ts';
import {
  FileConfiguration,
  fileConfigurationsSplitAtom,
} from '../../store/fileConfigurations.ts';

export function CollapsedOutputPanel() {
  const setLayout = useSetAtom(layoutAtom);

  function onToggle() {
    setLayout('transform');
  }

  return (
    <Flex
      direction="row"
      justify="center"
      align="start"
      px="4"
      py="3"
      style={{ borderLeft: '1px solid var(--gray-6)' }}
    >
      <IconButton onClick={onToggle} size="2" variant={chevronButtonVariant}>
        <ExitIcon />
      </IconButton>
    </Flex>
  );
}

export function OutputPanel() {
  const [fileConfigurationAtoms] = useAtom(fileConfigurationsSplitAtom);

  return (
    <Panel hasBorder header={<OutputPanelHeader />}>
      <ScrollArea>
        <Flex direction="column" p="5" gap="3">
          {fileConfigurationAtoms.map((fileConfigurationAtom, i) => (
            <OutputFileCard key={i} configurationAtom={fileConfigurationAtom} />
          ))}
        </Flex>
      </ScrollArea>
    </Panel>
  );
}

export function OutputPanelHeader() {
  // const [layout, setLayout] = useAtom(layoutAtom);
  // function onToggle() {
  //   if (layout === 'output') {
  //     setLayout('transform');
  //   } else {
  //     setLayout('output');
  //   }
  // }

  return (
    <Flex
      direction="row"
      gap="4"
      align="center"
      px="5"
      py="4"
      justify="between"
    >
      <Flex direction="row" gap="1" align="center">
        <ExitIcon />
        <Heading size="4" weight="medium">
          Output
        </Heading>
      </Flex>
      {/*<IconButton onClick={onToggle} size="2" variant={chevronButtonVariant}>*/}
      {/*  <ChevronRightIcon />*/}
      {/*</IconButton>*/}
    </Flex>
  );
}

export function OutputFileCard({
  configurationAtom,
}: {
  configurationAtom: PrimitiveAtom<FileConfiguration>;
}) {
  const [configuration] = useAtom(configurationAtom);

  if (configuration.filename === '' || configuration.extension === '') {
    return null;
  }

  return (
    <Flex
      direction="column"
      py="3"
      px="4"
      style={{
        border: '1px solid var(--gray-6)',
        borderRadius: 'var(--radius-2)',
        background: 'var(--gray-3)',
      }}
    >
      <Flex direction="column" gap="1">
        <Code size="3" variant="ghost" weight="bold">
          {configuration.filename}.{configuration.extension}
        </Code>
      </Flex>
    </Flex>
  );
}
