import React from 'react';
import { IconButton, Toolbar, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import { useToolbarStyles } from '../../__shared__/styles';

const ProductsTableToolbar: React.FC = () => {
  const classes = useToolbarStyles();

  return (
    <Toolbar className={classes.root}>
      <Typography variant="h1" className={classes.title}>
        Products
      </Typography>
      <Tooltip title="Add new product">
        <span>
          <IconButton disabled>
            <AddIcon></AddIcon>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Filter products">
        <span>
          <IconButton disabled>
            <FilterListIcon></FilterListIcon>
          </IconButton>
        </span>
      </Tooltip>
    </Toolbar>
  );
};

export default ProductsTableToolbar;
