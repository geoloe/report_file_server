import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';
import { defineRoutes } from './routes';
import { capabilitiesProvider } from './capabilities_provider';

export class ReportFileServerPlugin implements Plugin {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.info('Setting up Report File Server plugin...');

    const router = core.http.createRouter();
    defineRoutes(router);

    // Register the capabilities provider for the plugin
    core.capabilities.registerProvider(capabilitiesProvider);

    // Register the readonlyService to handle role-based UI restrictions
    core.capabilities.registerSwitcher(async (request, capabilities) => {
      return await core.security.readonlyService().hideForReadonly(request, capabilities, {
        reportFileServer: {
          show: true,
          save: false,
          delete: false,
        },
      });
    });

    this.logger.info('Routes defined for Report File Server plugin.');
  }

  public start(core: CoreStart) {
    this.logger.info('Starting Report File Server plugin...');
  }

  public stop() {
    this.logger.info('Stopping Report File Server plugin...');
  }
}
