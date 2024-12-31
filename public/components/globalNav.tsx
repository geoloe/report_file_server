import React from 'react';
import { CoreStart } from '../../../../src/core/public';
import ReportNavigation from './ReportNavigation';
import { render, unmountComponentAtNode } from 'react-dom';

export const registerGlobalNavigation = (coreStart: CoreStart) => {
  // Register the navigation item to the left side of the global header
  coreStart.chrome.navControls.registerCenter({
    mount: (element) => {
      // Render ReportNavigation and pass coreStart to it
      render(<ReportNavigation coreStart={coreStart} />, element);

      // Return an unmount function
      return () => {
        unmountComponentAtNode(element);
      };
    },
  });
};