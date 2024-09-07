import { PrimitiveAtom, useAtom, useSetAtom } from 'jotai';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Select,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes';
import {
  GearIcon,
  FilePlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons';

import { Panel } from '../Panel/Panel.tsx';
import {
  FileConfiguration,
  fileConfigurationsAtom,
  fileConfigurationsSplitAtom,
} from '../../store/fileConfigurations.ts';
import { chevronButtonVariant, errorColor } from '../../style.ts';

export function TransformPanel() {
  const setFileConfigurations = useSetAtom(fileConfigurationsAtom);
  const [splitAtoms, dispatch] = useAtom(fileConfigurationsSplitAtom);

  function handleNewFileClick() {
    setFileConfigurations((prev) => [
      ...prev,
      {
        isCardOpened: true,
        filename: '',
        extension: '',
        selections: [],
      },
    ]);
  }

  return (
    <Panel
      hasBorder
      header={<TransformPanelHeader onNewFile={handleNewFileClick} />}
    >
      <ScrollArea>
        <Flex direction="column" gap="4" p="5">
          {splitAtoms.map((c, i) => (
            <FileConfigurationCard
              key={i}
              configurationAtom={c}
              removeItem={() => {
                dispatch({ type: 'remove', atom: c });
              }}
            />
          ))}
        </Flex>
      </ScrollArea>
    </Panel>
  );
}

export function FileConfigurationCard({
  configurationAtom,
  removeItem,
}: {
  configurationAtom: PrimitiveAtom<FileConfiguration>;
  removeItem: () => void;
}) {
  const [configuration, setConfiguration] = useAtom(configurationAtom);

  function handleFilenameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfiguration((p) => ({
      ...p,
      filename: e.target.value,
    }));
  }
  function handleExtensionChange(value: string) {
    setConfiguration((p) => ({
      ...p,
      extension: value,
    }));
  }
  function toggleCardDisplay() {
    setConfiguration((prev) => ({
      ...prev,
      isCardOpened: !prev.isCardOpened,
    }));
  }

  return (
    <Box
      style={{
        border: '1px solid var(--gray-6)',
        borderRadius: 'var(--radius-3)',
        overflow: 'hidden',
      }}
    >
      <Flex
        direction="row"
        justify="between"
        align="center"
        py="4"
        pl="5"
        pr="5"
        style={{
          background: 'var(--gray-3)',
        }}
      >
        <Flex direction="row" gap="4">
          <TextField.Root
            placeholder="Filename"
            value={configuration.filename}
            onChange={handleFilenameChange}
          />
          <Select.Root defaultValue="__" onValueChange={handleExtensionChange}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item disabled value="__">
                Select
              </Select.Item>
              <Select.Item value="css">.css</Select.Item>
              <Select.Item value="json">.json</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
        <Flex direction="row" gap="4" align="center">
          {configuration.isCardOpened && (
            <IconButton variant="ghost" color={errorColor} onClick={removeItem}>
              <TrashIcon />
            </IconButton>
          )}
          <IconButton
            variant={chevronButtonVariant}
            onClick={toggleCardDisplay}
          >
            {configuration.isCardOpened ? (
              <ChevronUpIcon />
            ) : (
              <ChevronDownIcon />
            )}
          </IconButton>
        </Flex>
      </Flex>
      {configuration.isCardOpened && (
        <Flex direction="column" gap="4" px="5" py="4">
          <Flex direction="column" gap="2">
            <Heading size="4" weight="medium">
              Select
            </Heading>
            <Separator size="4" />
          </Flex>
        </Flex>
      )}
    </Box>
  );
}

export function InitTransformPanel() {
  return (
    <Flex
      direction="column"
      gap="6"
      pt="9"
      pr="6"
      pb="6"
      pl="6"
      maxWidth="660px"
      style={{
        borderLeft: '1px solid var(--gray-6)',
      }}
    >
      <Heading size="8" weight="light">
        Design tokens exporter
      </Heading>
      <Text size="4">
        The design tokens exporter bridges the gap between the design and
        development usage of design tokens.
      </Text>
    </Flex>
  );
}

export function TransformPanelHeader({ onNewFile }: { onNewFile: () => void }) {
  return (
    <Flex
      direction="row"
      gap="4"
      align="center"
      px="5"
      py="3"
      justify="between"
    >
      {/*<Button variant="ghost" color="gray">*/}
      <Flex direction="row" gap="1" align="center">
        <GearIcon />
        <Heading size="4" weight="medium">
          Configuration
        </Heading>
      </Flex>
      {/*</Button>*/}
      <Button onClick={onNewFile} size="2">
        <FilePlusIcon />
        <span>New file</span>
      </Button>
    </Flex>
  );
}
