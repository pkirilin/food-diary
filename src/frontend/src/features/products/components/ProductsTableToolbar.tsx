import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { Fragment, useState, type MouseEvent, type FC } from 'react';
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

  const handleFilterClick = (event: MouseEvent<HTMLButtonElement>): void => {
    showFilter(event);
  };

  const handleDeleteClick = (): void => {
    setIsDeleteDialogOpened(true);
  };

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
        <Stack
          width="100%"
          spacing={2}
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
            spacing={2}
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <TextField
              size="small"
              placeholder="Search by name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={theme => ({
                minWidth: '200px',
                width: '100%',
                [theme.breakpoints.up('sm')]: {
                  width: '200px',
                },
              })}
            />
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
    </Toolbar>
  );
};

export default ProductsTableToolbar;
