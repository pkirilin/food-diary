import React from 'react';
import './Categories.scss';
import { ContentWrapper, MainContainer, SectionContainer } from '../ContainerBlocks';
import Sidebar from '../Sidebar';
import CategoriesListControlsTopConnected from '../CategoriesListControlsTop';
import CategoriesListConnected from '../CategoriesList';

const Categories: React.FC = () => {
  return (
    <ContentWrapper>
      <Sidebar>
        <CategoriesListControlsTopConnected></CategoriesListControlsTopConnected>
        <CategoriesListConnected></CategoriesListConnected>
      </Sidebar>
      <MainContainer withSidebar>
        <SectionContainer>Categories content</SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Categories;
