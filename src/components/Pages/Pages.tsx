import React from 'react';
import './Pages.scss';
import Sidebar from '../Sidebar/Sidebar';
import FDContentWrapper from '../Layout/FDContentWrapper';
import FDMainContainer from '../Layout/FDMainContainer';
import FDContent from '../Layout/FDContent';
import PagesList from '../PagesList/PagesListConnected';

const Pages: React.FC = () => {
  return (
    <FDContentWrapper>
      <Sidebar>
        <PagesList></PagesList>
      </Sidebar>
      <FDMainContainer withSidebar>
        <FDContent>Pages content</FDContent>
      </FDMainContainer>
    </FDContentWrapper>
  );
};

export default Pages;
