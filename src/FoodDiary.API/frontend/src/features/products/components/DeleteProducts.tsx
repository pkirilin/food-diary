import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, IconButton } from '@mui/material';
import React, { useState } from 'react';
import { useAppSelector } from 'src/hooks';
import { selectCheckedProductIds } from '../selectors';
import DeleteProductsDialog from './DeleteProductsDialog';

const DeleteProducts: React.FC = () => {
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const checkedProductIds = useAppSelector(selectCheckedProductIds);

  function handleDeleteClick() {
    setIsDeleteDialogOpened(true);
  }

  return (
    <React.Fragment>
      {checkedProductIds.length > 0 && (
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
