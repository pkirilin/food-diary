import React, { useEffect } from 'react';
import './CategoriesList.scss';
import { SidebarList, SidebarListPlaceholder } from '../SidebarBlocks';
import CategoriesListItemConnected from '../CategoriesListItem';
import { CategoriesListStateToPropsMapResult, CategoriesListDispatchToPropsMapResult } from './CategoriesListConnected';
import { Loader } from '../__ui__';

interface CategoriesListProps extends CategoriesListStateToPropsMapResult, CategoriesListDispatchToPropsMapResult {}

const CategoriesList: React.FC<CategoriesListProps> = ({
  categoryItems,
  categoryItemsFetchState,
  getCategories,
}: CategoriesListProps) => {
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const { loading, loaded, error: errorMessage, loadingMessage } = categoryItemsFetchState;

  if (loading) {
    return (
      <SidebarListPlaceholder>
        <Loader label={loadingMessage}></Loader>
      </SidebarListPlaceholder>
    );
  }

  if (!loaded) {
    return <SidebarListPlaceholder type="info">{errorMessage}</SidebarListPlaceholder>;
  }

  return categoryItems.length > 0 ? (
    <SidebarList>
      {categoryItems.map(category => (
        <CategoriesListItemConnected key={category.id} category={category}></CategoriesListItemConnected>
      ))}
    </SidebarList>
  ) : (
    <SidebarListPlaceholder type="info">No categories found</SidebarListPlaceholder>
  );
};

export default CategoriesList;
