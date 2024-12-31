import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface ReportFileServerPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ReportFileServerPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
