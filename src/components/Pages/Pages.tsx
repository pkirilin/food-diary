import React from 'react';
import './Pages.scss';
import Sidebar from '../Sidebar/Sidebar';
import FDContentWrapper from '../Layout/FDContentWrapper';
import FDMainContainer from '../Layout/FDMainContainer';
import FDContent from '../Layout/FDContent';

const Pages: React.FC = () => {
  return (
    <FDContentWrapper>
      <Sidebar>Pages sidebar</Sidebar>
      <FDMainContainer withSidebar>
        <FDContent>Pages content</FDContent>
      </FDMainContainer>
    </FDContentWrapper>
  );
};

export default Pages;
