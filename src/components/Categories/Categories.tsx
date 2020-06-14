import React, { useEffect } from 'react';
import './Categories.scss';
import CategoriesListControlsTopConnected from '../CategoriesListControlsTop';
import CategoriesListConnected from '../CategoriesList';
import CategoriesOperationsPanelConnected from '../CategoriesOperationsPanel';
import { Switch, Route } from 'react-router-dom';
import { CategoriesDispatchToPropsMapResult } from './CategoriesConnected';
import CategoryContentConnected from '../CategoryContent';
import { Container } from '../__ui__';

type CategoriesProps = CategoriesDispatchToPropsMapResult;

const Categories: React.FC<CategoriesProps> = ({ clearProductsFilter }: CategoriesProps) => {
  useEffect(() => {
    return (): void => {
      clearProductsFilter();
    };
  }, [clearProductsFilter]);

  return (
    <React.Fragment>
      <aside>
        <CategoriesListControlsTopConnected></CategoriesListControlsTopConnected>
        <CategoriesOperationsPanelConnected></CategoriesOperationsPanelConnected>
        <CategoriesListConnected></CategoriesListConnected>
      </aside>
      <main>
        <section>
          <Switch>
            <Route exact path="/categories">
              <Container justify="center" textColor="middle-green">
                No category selected
              </Container>
            </Route>
            <Route exact path="/categories/:id">
              <CategoryContentConnected></CategoryContentConnected>
            </Route>
          </Switch>
        </section>
      </main>
    </React.Fragment>
  );
};

export default Categories;
