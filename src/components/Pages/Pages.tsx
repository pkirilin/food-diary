import React from 'react';
import './Pages.scss';
import Sidebar from '../Sidebar';
import { ContentWrapper, MainContainer, SectionContainer } from '../ContainerBlocks';
import PagesListConnected from '../PagesList';
import PagesListControlsTopConnected from '../PagesListControlsTop';
import PagesListControlsBottomConnected from '../PagesListControlsBottom';
import { Switch, Route, Redirect } from 'react-router-dom';
import PagesSelectionPanelConnected from '../PagesSelectionPanel';
import { StateToPropsMapResult } from './PagesConnected';
import PageContentConnected from '../PageContent';

type PagesProps = StateToPropsMapResult;

const Pages: React.FC<PagesProps> = ({ isPagesListAvailable, pagesCount, firstPageId }: PagesProps) => {
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
          {isPagesListAvailable ? (
            <Switch>
              <Route exact path="/pages/:id">
                <PageContentConnected></PageContentConnected>
              </Route>
              <Redirect from="/pages" to={firstPageId === undefined ? '/pages/' : `/pages/${firstPageId}`}></Redirect>
            </Switch>
          ) : (
            // TODO: add user-friendly placeholder to display notes content if items are not loaded
            <Switch>
              <Redirect to="/pages/"></Redirect>
            </Switch>
          )}
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Pages;
