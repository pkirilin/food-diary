import React from 'react';
import './Pages.scss';
import Sidebar from '../Sidebar';
import { ContentWrapper, MainContainer, SectionContainer, SectionPlaceholder } from '../ContainerBlocks';
import PagesListConnected from '../PagesList';
import PagesListControlsTopConnected from '../PagesListControlsTop';
import PagesListControlsBottomConnected from '../PagesListControlsBottom';
import { Switch, Route } from 'react-router-dom';
import PagesSelectionPanelConnected from '../PagesSelectionPanel';
import { PagesStateToPropsMapResult } from './PagesConnected';
import PageContentConnected from '../PageContent';

type PagesProps = PagesStateToPropsMapResult;

const Pages: React.FC<PagesProps> = ({ isPagesListAvailable, pagesCount }: PagesProps) => {
  return (
    <ContentWrapper>
      <Sidebar>
        <PagesListControlsTopConnected></PagesListControlsTopConnected>
        {isPagesListAvailable && pagesCount > 0 && <PagesSelectionPanelConnected></PagesSelectionPanelConnected>}
        <PagesListConnected></PagesListConnected>
        <PagesListControlsBottomConnected></PagesListControlsBottomConnected>
      </Sidebar>
      <MainContainer withSidebar>
        <SectionContainer>
          <Switch>
            <Route exact path="/pages">
              <SectionPlaceholder>No page selected</SectionPlaceholder>
            </Route>
            <Route exact path="/pages/:id">
              <PageContentConnected></PageContentConnected>
            </Route>
          </Switch>
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Pages;
