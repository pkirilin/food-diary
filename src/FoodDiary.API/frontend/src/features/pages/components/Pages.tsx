import { Box, Container, Paper } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import ExportMenu from './ExportMenu';
import PagesFilterAppliedParams from './PagesFilterAppliedParams';
import PagesTable from './PagesTable';
import PagesTablePagination from './PagesTablePagination';
import PagesToolbar from './PagesToolbar';

const Pages: React.FC = () => {
  return (
    <Container>
      <Helmet>
        <title>Food diary | Pages</title>
      </Helmet>
      <Box py={3}>
        <Paper variant="outlined" square>
          <PagesToolbar>
            <ExportMenu />
          </PagesToolbar>
          <PagesFilterAppliedParams />
          <PagesTable />
          <PagesTablePagination />
        </Paper>
      </Box>
    </Container>
  );
};

export default Pages;
