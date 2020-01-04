import React from 'react';
import './Pages.scss';
import Sidebar from '../Sidebar';
import { FDContent, FDContentWrapper, FDMainContainer } from '../Layout';
import PagesListConnected from '../PagesList';
import PagesListControlPanelConnected from '../PagesListControlPanel';
import PagesListControlsBottomConnected from '../PagesListControlsBottom';

const Pages: React.FC = () => {
  return (
    <FDContentWrapper>
      <Sidebar>
        <PagesListControlPanelConnected></PagesListControlPanelConnected>
        <PagesListConnected></PagesListConnected>
        <PagesListControlsBottomConnected></PagesListControlsBottomConnected>
      </Sidebar>
      <FDMainContainer withSidebar>
        <FDContent>Pages content</FDContent>
      </FDMainContainer>
    </FDContentWrapper>
  );
};

export default Pages;
