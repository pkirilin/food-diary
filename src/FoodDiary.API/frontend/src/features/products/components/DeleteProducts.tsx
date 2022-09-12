import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, IconButton } from '@mui/material';
import React, { useState } from 'react';
import { useAppSelector } from 'src/hooks';
import DeleteProductsDialog from './DeleteProductsDialog';

const DeleteProducts: React.FC = () => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const selectedProductIds = useAppSelector(state => state.products.selectedProductIds);

  function handleDeleteClick() {
    setIsDeleteDialogOpened(true);
  }

  return (
    <React.Fragment>
      {selectedProductIds.length > 0 && (
        <Tooltip title="Delete product">
          <IconButton
            onClick={handleDeleteClick}
            size="large"
            aria-label="Delete selected products"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}

      <DeleteProductsDialog isOpened={isDeleteDialogOpened} setIsOpened={setIsDeleteDialogOpened} />
    </React.Fragment>
  );
};

export default DeleteProducts;
