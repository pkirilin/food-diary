import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { IconButton, Popover, Toolbar, Tooltip, Typography } from '@mui/material';
import { Fragment, useState, MouseEvent, FC } from 'react';
import { usePopover, useAppSelector } from '../../__shared__/hooks';
import { useToolbarStyles } from '../../__shared__/styles';
import { selectCheckedProductIds } from '../selectors';
import CreateProduct from './CreateProduct';
import DeleteProductsDialog from './DeleteProductsDialog';
import ProductsFilter from './ProductsFilter';

const ProductsTableToolbar: FC = () => {
  const classes = useToolbarStyles();
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const [filter, showFilter] = usePopover();
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const isSelectionActive = checkedProductIds.length > 0;

  function handleFilterClick(event: MouseEvent<HTMLButtonElement>) {
    showFilter(event);
  }

  function handleDeleteClick() {
    setIsDeleteDialogOpened(true);
  }

  return (
    <Toolbar className={classes.root}>
      {isSelectionActive && (
        <Fragment>
          <Typography flexGrow={1}>{checkedProductIds.length} selected</Typography>
          <Tooltip title="Delete product">
            <IconButton
              onClick={handleDeleteClick}
              size="large"
              aria-label="Delete selected products"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Fragment>
      )}
      {!isSelectionActive && (
        <Fragment>
          <Typography variant="h2" flexGrow={1}>
            Products
          </Typography>
          <Tooltip title="Filter products">
            <span>
              <IconButton
                size="large"
                onClick={handleFilterClick}
                aria-label="Open products filter"
              >
                <FilterListIcon />
              </IconButton>
            </span>
          </Tooltip>
          <CreateProduct />
        </Fragment>
      )}
      <DeleteProductsDialog isOpened={isDeleteDialogOpened} setIsOpened={setIsDeleteDialogOpened} />
      <Popover
        {...filter}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <ProductsFilter />
      </Popover>
    </Toolbar>
  );
};

export default ProductsTableToolbar;
