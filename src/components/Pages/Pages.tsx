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
          <Switch>
            <Route exact path="/pages/:id">
              <PageContentConnected></PageContentConnected>
            </Route>
            <Redirect from="/pages" to={firstPageId === undefined ? '/pages/' : `/pages/${firstPageId}`}></Redirect>
          </Switch>
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Pages;
