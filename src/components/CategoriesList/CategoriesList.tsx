import React, { useEffect } from 'react';
import './CategoriesList.scss';
import { SidebarList, SidebarListPlaceholder } from '../SidebarBlocks';
import CategoriesListItemConnected from '../CategoriesListItem';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './CategoriesListConnected';
import Loader from '../Loader';
import CategoriesListItemEditableConnected from '../CategoriesListItem/CategoriesListItemEditableConnected';

interface CategoriesListProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const CategoriesList: React.FC<CategoriesListProps> = ({
  categoryItems,
  categoryItemsFetchState,
  categoryDraftItems,
  getCategories,
}: CategoriesListProps) => {
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const { loading, loaded, error: errorMessage } = categoryItemsFetchState;

  if (loading) {
    return (
      <SidebarListPlaceholder>
        <Loader label="Loading categories"></Loader>
      </SidebarListPlaceholder>
    );
  }

  if (!loaded) {
    return <SidebarListPlaceholder type="info">{errorMessage}</SidebarListPlaceholder>;
  }

  return categoryItems.length > 0 ? (
    <SidebarList>
      {categoryDraftItems.map(category => (
        <CategoriesListItemEditableConnected
          key={category.id}
          category={category}
          isDraft={true}
        ></CategoriesListItemEditableConnected>
      ))}
      {categoryItems.map(category => (
        <CategoriesListItemConnected key={category.id} category={category}></CategoriesListItemConnected>
      ))}
    </SidebarList>
  ) : (
    <SidebarListPlaceholder type="info">No categories found</SidebarListPlaceholder>
  );
};

export default CategoriesList;
