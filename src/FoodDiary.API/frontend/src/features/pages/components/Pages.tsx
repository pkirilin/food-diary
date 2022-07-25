import { Paper } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import ExportMenu from './ExportMenu';
import PagesFilterAppliedParams from './PagesFilterAppliedParams';
import PagesTable from './PagesTable';
import PagesTablePagination from './PagesTablePagination';
import PagesToolbar from './PagesToolbar';

const Pages: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <Helmet>
        <title>Food diary | Pages</title>
      </Helmet>
      <PagesToolbar>
        <ExportMenu />
      </PagesToolbar>
      <PagesFilterAppliedParams />
      <PagesTable />
      <PagesTablePagination />
    </Paper>
  );
};

export default Pages;
