export const capabilitiesProvider = () => ({
    catalogue: {
      discover: true,
      dashboard: true,
      visualize: true,
      console: true,
      advanced_settings: true,
      indexPatterns: true,
    },
    ['reportFileServer']: {
      show: true,
    },
});