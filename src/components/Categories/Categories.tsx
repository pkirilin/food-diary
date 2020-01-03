import React from 'react';
import './Categories.scss';
import { FDContent, FDContentWrapper, FDMainContainer } from '../Layout';
import Sidebar from '../Sidebar';

const Categories: React.FC = () => {
  return (
    <FDContentWrapper>
      <Sidebar>Categories sidebar</Sidebar>
      <FDMainContainer withSidebar>
        <FDContent>Categories content</FDContent>
      </FDMainContainer>
    </FDContentWrapper>
  );
};

export default Categories;
