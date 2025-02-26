import { PluginInitializerContext } from '../../../src/core/server';
import { ReportFileServerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new ReportFileServerPlugin(initializerContext);
}

export { ReportFileServerPluginSetup, ReportFileServerPluginStart } from './types';
