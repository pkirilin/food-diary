import React, { useEffect } from 'react';
import './Categories.scss';
import { ContentWrapper, MainContainer, SectionContainer, SectionPlaceholder } from '../ContainerBlocks';
import Sidebar from '../Sidebar';
import CategoriesListControlsTopConnected from '../CategoriesListControlsTop';
import CategoriesListConnected from '../CategoriesList';
import CategoriesOperationsPanelConnected from '../CategoriesOperationsPanel';
import { Switch, Route } from 'react-router-dom';
import { DispatchToPropsMapResult } from './CategoriesConnected';
import CategoryContentConnected from '../CategoryContent';

type CategoriesProps = DispatchToPropsMapResult;

const Categories: React.FC<CategoriesProps> = ({ clearProductsFilter }: CategoriesProps) => {
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
          <Switch>
            <Route exact path="/categories">
              <SectionPlaceholder>No category selected</SectionPlaceholder>
            </Route>
            <Route exact path="/categories/:id">
              <CategoryContentConnected></CategoryContentConnected>
            </Route>
          </Switch>
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Categories;
