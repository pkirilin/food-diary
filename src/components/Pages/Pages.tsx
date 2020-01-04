import React from 'react';
import './Pages.scss';
import Sidebar from '../Sidebar';
import { FDContent, FDContentWrapper, FDMainContainer } from '../Layout';
import PagesListConnected from '../PagesList';
import PagesListControlPanelConnected from '../PagesListControlPanel';

const Pages: React.FC = () => {
  return (
    <FDContentWrapper>
      <Sidebar>
        <PagesListControlPanelConnected></PagesListControlPanelConnected>
        <PagesListConnected></PagesListConnected>
      </Sidebar>
      <FDMainContainer withSidebar>
        <FDContent>Pages content</FDContent>
      </FDMainContainer>
    </FDContentWrapper>
  );
};

export default Pages;
