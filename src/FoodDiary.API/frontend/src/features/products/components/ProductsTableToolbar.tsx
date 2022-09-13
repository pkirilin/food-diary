import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, IconButton, Popover, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { usePopover, useAppSelector } from '../../__shared__/hooks';
import { selectCheckedProductIds } from '../selectors';
import DeleteProducts from './DeleteProducts';
import ProductsFilter from './ProductsFilter';

const ProductsTableToolbar: React.FC = () => {
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const [filter, showFilter] = usePopover();

  function handleFilterClick(event: React.MouseEvent<HTMLButtonElement>) {
    showFilter(event);
  }

  return (
    <Box paddingY={2}>
      <Box paddingX={2} display="flex" justifyContent="space-between" alignItems="center">
        {checkedProductIds.length > 0 && (
          <Typography>{checkedProductIds.length} selected</Typography>
        )}
        <DeleteProducts />
      </Box>
      {checkedProductIds.length === 0 && (
        <Box padding={0.5}>
          <Tooltip title="Filter products">
            <span>
              <IconButton onClick={handleFilterClick} aria-label="Open products filter">
                <FilterListIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
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
