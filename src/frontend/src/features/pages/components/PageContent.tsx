import { Box, Container } from '@mui/material';
import { type FC, useEffect } from 'react';
import { useAppDispatch, useRouterId } from 'src/hooks';
import { MealsList } from '../../notes/components';
import { getNotes } from '../../notes/thunks';
import { pagesApi } from '../api';
import PageContentHeader from './PageContentHeader';

const PageContent: FC = () => {
  const pageId = useRouterId('id');
  const getPageByIdQuery = pagesApi.useGetPageByIdQuery(pageId);
  const page = getPageByIdQuery.data?.currentPage ?? null;
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(getNotes({ pageId }));
  }, [dispatch, pageId]);

  return (
    <>
      <PageContentHeader page={page} />
      <Container>
        <Box pb={3}>
          <MealsList />
        </Box>
      </Container>
    </>
  );
};

export default PageContent;
