import { Paper, Typography } from '@mui/material';
import { Container, Box } from '@mui/system';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { Helmet } from 'react-helmet';
import ExportMenu from '../components/ExportMenu';
import PagesFilterAppliedParams from '../components/PagesFilterAppliedParams';
import PagesTable from '../components/PagesTable';
import PagesTablePagination from '../components/PagesTablePagination';
import PagesToolbar from '../components/PagesToolbar';

const Pages = () => {
  return (
    <Container>
      <Helmet>
        <title>Food diary | Pages</title>
      </Helmet>
      <Box py={3}>
        <Typography sx={visuallyHidden} variant="h1" gutterBottom>
          Pages
        </Typography>
        <Paper>
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
