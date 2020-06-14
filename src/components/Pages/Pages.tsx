import React from 'react';
import './Pages.scss';
import PagesListConnected from '../PagesList';
import PagesListControlsTopConnected from '../PagesListControlsTop';
import PagesListControlsBottomConnected from '../PagesListControlsBottom';
import { Switch, Route } from 'react-router-dom';
import PagesSelectionPanelConnected from '../PagesSelectionPanel';
import { PagesStateToPropsMapResult } from './PagesConnected';
import PageContentConnected from '../PageContent';
import { Container } from '../__ui__';

type PagesProps = PagesStateToPropsMapResult;

const Pages: React.FC<PagesProps> = ({ isPagesListAvailable, pagesCount }: PagesProps) => {
  return (
    <React.Fragment>
      <aside>
        <PagesListControlsTopConnected></PagesListControlsTopConnected>
        {isPagesListAvailable && pagesCount > 0 && <PagesSelectionPanelConnected></PagesSelectionPanelConnected>}
        <PagesListConnected></PagesListConnected>
        <PagesListControlsBottomConnected></PagesListControlsBottomConnected>
      </aside>
      <main>
        <section>
          <Switch>
            <Route exact path="/pages">
              <Container justify="center" textColor="middle-green">
                No page selected
              </Container>
            </Route>
            <Route exact path="/pages/:id">
              <PageContentConnected></PageContentConnected>
            </Route>
          </Switch>
        </section>
      </main>
    </React.Fragment>
  );
};

export default Pages;
