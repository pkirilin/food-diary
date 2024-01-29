import { Box, Container } from '@mui/material';
import { type FC } from 'react';
import { notesApi } from 'src/features/notes';
import { useRouterId } from 'src/hooks';
import { MealsList } from '../../notes/components';
import { pagesApi } from '../api';
import PageContentHeader from './PageContentHeader';

const PageContent: FC = () => {
  const pageId = useRouterId('id');
  const getPageByIdQuery = pagesApi.useGetPageByIdQuery(pageId);
  const getNotesQuery = notesApi.useGetNotesQuery({ pageId });
  const page = getPageByIdQuery.data?.currentPage ?? null;

  return (
    <>
      {page && <PageContentHeader page={page} />}
      <Container>
        <Box pb={3}>
          <MealsList notes={getNotesQuery.data ?? []} />
        </Box>
      </Container>
    </>
  );
};

export default PageContent;
