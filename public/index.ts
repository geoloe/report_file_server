import './index.scss';

import { ReportFileServerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin() {
  return new ReportFileServerPlugin();
}
export { ReportFileServerPluginSetup, ReportFileServerPluginStart } from './types';
