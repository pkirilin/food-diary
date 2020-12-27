import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteCategory, editCategory, openConfirmationModal, openModal } from '../../action-creators';
import { useHover, useTypedSelector } from '../../hooks';
import { CategoryEditRequest, CategoryItem } from '../../models';
import { Icon } from '../__ui__';
import CategoryInput from '../CategoryInput';

type CategoriesTableRowProps = {
  category: CategoryItem;
};

export const CategoriesTableRow: React.FC<CategoriesTableRowProps> = ({ category }: CategoriesTableRowProps) => {
  const [areIconsVisible, showIcons, hideIcons] = useHover();
  const areIconsDisabled = useTypedSelector(
    state => state.categories.operations.status.performing || state.categories.list.categoryItemsFetchState.loading,
  );
  const dispatch = useDispatch();

  const handleEditCategory = (): void => {
    dispatch(
      openModal(
        'Edit category',
        <CategoryInput
          category={category}
          onSubmit={(updatedCategory): void => {
            const payload: CategoryEditRequest = {
              id: category.id,
              category: updatedCategory,
            };
            dispatch(editCategory(payload));
          }}
        ></CategoryInput>,
        {
          width: '35%',
        },
      ),
    );
  };

  const handleDeleteCategory = (): void => {
    dispatch(
      openConfirmationModal(
        'Delete category',
        `Do you want to delete category "${category.name}" and all its products?`,
        () => {
          dispatch(deleteCategory(category.id));
        },
      ),
    );
  };

  return (
    <tr onMouseEnter={showIcons} onMouseLeave={hideIcons}>
      <td>{category.name}</td>
      <td>{category.countProducts}</td>
      {areIconsVisible ? (
        <React.Fragment>
          <td>
            <Icon
              type="edit"
              size="small"
              title="Edit category"
              disabled={areIconsDisabled}
              onClick={handleEditCategory}
            ></Icon>
          </td>
          <td>
            <Icon
              type="close"
              size="small"
              title="Delete category"
              disabled={areIconsDisabled}
              onClick={handleDeleteCategory}
            ></Icon>
          </td>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <td></td>
          <td></td>
        </React.Fragment>
      )}
    </tr>
  );
};
