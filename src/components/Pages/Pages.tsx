import React from 'react';
import './Pages.scss';
import Sidebar from '../Sidebar';
import { ContentWrapper, MainContainer, SectionContainer } from '../ContainerBlocks';
import PagesListConnected from '../PagesList';
import PagesListControlsTopConnected from '../PagesListControlsTop';
import PagesListControlsBottomConnected from '../PagesListControlsBottom';

const Pages: React.FC = () => {
  return (
    <ContentWrapper>
      <Sidebar>
        <PagesListControlsTopConnected></PagesListControlsTopConnected>
        <PagesListConnected></PagesListConnected>
        <PagesListControlsBottomConnected></PagesListControlsBottomConnected>
      </Sidebar>
      <MainContainer withSidebar>
        <SectionContainer>Pages content</SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Pages;
