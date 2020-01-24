import React from 'react';
import './Pages.scss';
import Sidebar from '../Sidebar';
import { ContentWrapper, MainContainer, SectionContainer } from '../ContainerBlocks';
import PagesListConnected from '../PagesList';
import PagesListControlsTopConnected from '../PagesListControlsTop';
import PagesListControlsBottomConnected from '../PagesListControlsBottom';
import { Switch, Route, Redirect } from 'react-router-dom';
import PagesSelectionPanelConnected from '../PagesSelectionPanel';

const Pages: React.FC = () => {
  // TODO: take this from store
  const firstPageId = 1;

  return (
    <ContentWrapper>
      <Sidebar>
        <PagesListControlsTopConnected></PagesListControlsTopConnected>
        <PagesSelectionPanelConnected></PagesSelectionPanelConnected>
        <PagesListConnected></PagesListConnected>
        <PagesListControlsBottomConnected></PagesListControlsBottomConnected>
      </Sidebar>
      <MainContainer withSidebar>
        <SectionContainer>
          <Switch>
            <Route exact path="/pages/:id">
              Pages content
            </Route>
            <Redirect from="/pages" to={`/pages/${firstPageId}`}></Redirect>
          </Switch>
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Pages;
