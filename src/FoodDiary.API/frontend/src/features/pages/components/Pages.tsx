import React from 'react';
import { Helmet } from 'react-helmet';
import { Paper } from '@mui/material';
import PagesTable from './PagesTable';
import PagesToolbar from './PagesToolbar';
import PagesTablePagination from './PagesTablePagination';
import PagesFilterAppliedParams from './PagesFilterAppliedParams';
import ExportMenu from './ExportMenu';

const Pages: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <Helmet>
        <title>Food diary | Pages</title>
      </Helmet>
      <PagesToolbar>
        <ExportMenu></ExportMenu>
      </PagesToolbar>
      <PagesFilterAppliedParams></PagesFilterAppliedParams>
      <PagesTable></PagesTable>
      <PagesTablePagination></PagesTablePagination>
    </Paper>
  );
};

export default Pages;
