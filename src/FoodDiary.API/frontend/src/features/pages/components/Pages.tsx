import React from 'react';
import { Helmet } from 'react-helmet';
import { Paper } from '@material-ui/core';
import PagesTable from './PagesTable';
import PagesToolbar from './PagesToolbar';
import PagesTablePagination from './PagesTablePagination';
import PagesFilterAppliedParams from './PagesFilterAppliedParams';

const Pages: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <Helmet>
        <title>Food diary | Pages</title>
      </Helmet>
      <PagesToolbar></PagesToolbar>
      <PagesFilterAppliedParams></PagesFilterAppliedParams>
      <PagesTable></PagesTable>
      <PagesTablePagination></PagesTablePagination>
    </Paper>
  );
};

export default Pages;
