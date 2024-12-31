import { i18n } from '@osd/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  ReportFileServerPluginSetup,
  ReportFileServerPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME } from '../common';
import { renderApp } from './application';
import { registerGlobalNavigation } from './components/globalNav'; // Ensure this is correctly imported

export class ReportFileServerPlugin
  implements Plugin<ReportFileServerPluginSetup, ReportFileServerPluginStart> {
  public setup(core: CoreSetup): ReportFileServerPluginSetup {
    // Register the application in the side navigation menu
    core.application.register({
      id: 'reportFileServer',
      title: PLUGIN_NAME,
      async mount(params: AppMountParameters) {
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();

        // Render the application
        const unmount = renderApp(coreStart, depsStart as AppPluginStartDependencies, params);

        // Return a cleanup function (AppUnmount) to be called when the app is unmounted
        return () => {
          unmount(); // Call any unmount logic from renderApp if it's provided
        };
      },
    });

    return {
      getGreeting() {
        return i18n.translate('reportFileServer.greetingText', {
          defaultMessage: 'Welcome to the {name} plugin!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
  }

  public start(core: CoreStart): ReportFileServerPluginStart {
    // Register the global navigation button in the top navigation bar
    registerGlobalNavigation(core);

    return {
      renderNavigation() {
        // You no longer need to render the ReportNavigation directly here
        // because the global navigation is handled by registerGlobalNavigation
        return null;
      },
    };
  }

  public stop() {
    // Any stop/cleanup logic can go here if needed
  }
}