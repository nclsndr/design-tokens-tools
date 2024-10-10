import { RequestAction } from '@common/actions/actions';
import { seedTestingDataHandler } from '@plugin/actions/seedTestingDataHandler';
import { getVariablesAndCollectionsHandler } from '@plugin/actions/getVariablesAndCollectionsHandler';

if (figma.editorType === 'figma') {
  figma.showUI(__html__, {
    width: 600,
    height: 450,
    title: 'Design Tokens Sync',
    // themeColors: true,
  });

  figma.ui.onmessage = async (msg: RequestAction) => {
    switch (msg.action) {
      case 'GET_VARIABLES_AND_COLLECTIONS': {
        await getVariablesAndCollectionsHandler(msg);
        break;
      }
      case 'SEED_TESTING_DATA': {
        await seedTestingDataHandler(msg);
        break;
      }
      default: {
        console.log('Unknown action', msg);
        break;
      }
    }
  };
}
