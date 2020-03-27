import React, { useEffect } from 'react';
import './CategoriesList.scss';
import { SidebarList, SidebarListPlaceholder } from '../SidebarBlocks';
import CategoriesListItemConnected from '../CategoriesListItem';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './CategoriesListConnected';
import Loader from '../Loader';

interface CategoriesListProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const CategoriesList: React.FC<CategoriesListProps> = ({
  categoryItems,
  categoryItemsFetchState,
  getCategories,
}: CategoriesListProps) => {
  const { loading, loaded, error: errorMessage } = categoryItemsFetchState;

  useEffect(() => {
    getCategories({});
  }, [getCategories]);

  if (loading) {
    return (
      <SidebarListPlaceholder>
        <Loader label="Loading categories"></Loader>
      </SidebarListPlaceholder>
    );
  }

  if (loaded) {
    return categoryItems.length > 0 ? (
      <SidebarList>
        {categoryItems.map(category => (
          <CategoriesListItemConnected key={category.id} data={category}></CategoriesListItemConnected>
        ))}
      </SidebarList>
    ) : (
      <SidebarListPlaceholder type="info">No categories found</SidebarListPlaceholder>
    );
  }

  return <SidebarListPlaceholder type="info">{errorMessage}</SidebarListPlaceholder>;
};

export default CategoriesList;
