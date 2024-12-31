import React from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHeaderSectionItem,
} from '@elastic/eui';
import { CoreStart } from 'src/core/public';

interface ReportNavigationProps {
  coreStart: CoreStart;
}

const ReportNavigation: React.FC<ReportNavigationProps> = ({ coreStart }) => {
  const handleNavigation = () => {
    coreStart.application.navigateToApp('reportFileServer'); // Replace with your app's ID
  };

  return (
    <EuiHeaderSectionItem>
      <EuiFlexGroup
        direction="row"
        gutterSize="s"
        alignItems="center"
        justifyContent="flexStart"
        responsive={false} // Prevent automatic stacking
        style={{ flexWrap: 'nowrap' }} // Prevent items from wrapping
      >
        <EuiFlexItem
          grow={false}
          style={{
            marginLeft: '8px', // Add spacing from the separator
            marginRight: '8px', // Optional: Add spacing for uniformity
          }}
        >
          <EuiButton
            onClick={handleNavigation}
            size="s"
            iconType="reportingApp"
            iconSide="left"
          >
            Reports
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiHeaderSectionItem>
  );
};

export default ReportNavigation;