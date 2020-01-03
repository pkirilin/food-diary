import React from 'react';
import './Pages.scss';
import Sidebar from '../Sidebar';
import { FDContent, FDContentWrapper, FDMainContainer } from '../Layout';
import PagesListConnected from '../PagesList';

const Pages: React.FC = () => {
  return (
    <FDContentWrapper>
      <Sidebar>
        <PagesListConnected></PagesListConnected>
      </Sidebar>
      <FDMainContainer withSidebar>
        <FDContent>Pages content</FDContent>
      </FDMainContainer>
    </FDContentWrapper>
  );
};

export default Pages;
