import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent, type FC } from 'react';
import { usePopover, useAppSelector } from '../../__shared__/hooks';
import { selectCheckedProductIds } from '../selectors';
import CreateProduct from './CreateProduct';
import DeleteProductsDialog from './DeleteProductsDialog';
import ProductsFilter from './ProductsFilter';
import SearchByName from './SearchByName';

const ProductsTableToolbar: FC = () => {
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const [filter, showFilter] = usePopover();
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const isSelectionActive = checkedProductIds.length > 0;

  const handleFilterClick = (event: MouseEvent<HTMLButtonElement>): void => {
    showFilter(event);
  };

  const handleDeleteClick = (): void => {
    setIsDeleteDialogOpened(true);
  };

  return (
    <Box p={2}>
      {isSelectionActive && (
        <Stack direction="row" spacing={2} alignItems="center">
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
        </Stack>
      )}
      {!isSelectionActive && (
        <Stack
          width="100%"
          spacing={{ xs: 3, sm: 2 }}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="h2" flexGrow={1}>
            Products
          </Typography>
          <Stack
            width="100%"
            flex={1}
            spacing={{ xs: 3, sm: 2 }}
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <SearchByName />
            <TextField
              size="small"
              label="Category"
              select
              value={' '}
              sx={theme => ({
                minWidth: '200px',
                width: '100%',
                [theme.breakpoints.up('sm')]: {
                  width: '200px',
                },
              })}
            >
              <MenuItem value={' '}>All</MenuItem>
              <MenuItem value={'cereals'}>Cereals</MenuItem>
              <MenuItem value={'dairy'}>Dairy</MenuItem>
            </TextField>
            <Stack direction="row">
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
            </Stack>
          </Stack>
        </Stack>
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
    </Box>
  );
};

export default ProductsTableToolbar;
