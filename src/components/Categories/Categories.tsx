import React from 'react';
import './Categories.scss';
import FDContentWrapper from '../Layout/FDContentWrapper';
import FDMainContainer from '../Layout/FDMainContainer';
import FDContent from '../Layout/FDContent';
import Sidebar from '../Sidebar/Sidebar';

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
