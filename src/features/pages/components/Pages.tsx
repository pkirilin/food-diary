import React from 'react';
import { Paper } from '@material-ui/core';
import PagesTable from './PagesTable';
import PagesTableToolbar from './PagesTableToolbar';
import PagesTablePagination from './PagesTablePagination';

const Pages: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <PagesTableToolbar></PagesTableToolbar>
      <PagesTable></PagesTable>
      <PagesTablePagination></PagesTablePagination>
    </Paper>
  );
};

export default Pages;
