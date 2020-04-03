import React, { useEffect } from 'react';
import './Categories.scss';
import { ContentWrapper, MainContainer, SectionContainer } from '../ContainerBlocks';
import Sidebar from '../Sidebar';
import CategoriesListControlsTopConnected from '../CategoriesListControlsTop';
import CategoriesListConnected from '../CategoriesList';
import CategoriesOperationsPanelConnected from '../CategoriesOperationsPanel';
import { Switch, Route, Redirect } from 'react-router-dom';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './CategoriesConnected';
import CategoryContentConnected from '../CategoryContent';

interface CategoriesProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const Categories: React.FC<CategoriesProps> = ({
  isCategoriesListAvailable,
  firstCategoryId,
  clearProductsFilter,
}: CategoriesProps) => {
  useEffect(() => {
    return (): void => {
      clearProductsFilter();
    };
  }, [clearProductsFilter]);

  return (
    <ContentWrapper>
      <Sidebar>
        <CategoriesListControlsTopConnected></CategoriesListControlsTopConnected>
        <CategoriesOperationsPanelConnected></CategoriesOperationsPanelConnected>
        <CategoriesListConnected></CategoriesListConnected>
      </Sidebar>
      <MainContainer withSidebar>
        <SectionContainer>
          {isCategoriesListAvailable ? (
            <Switch>
              <Route exact path="/categories/:id">
                <CategoryContentConnected></CategoryContentConnected>
              </Route>
              <Redirect
                from="/categories"
                to={firstCategoryId === undefined ? '/categories/' : `/categories/${firstCategoryId}`}
              ></Redirect>
            </Switch>
          ) : (
            <Switch>
              <Redirect to="/categories/"></Redirect>
            </Switch>
          )}
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Categories;
