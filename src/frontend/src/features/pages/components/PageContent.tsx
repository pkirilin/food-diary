import { Box, Container } from '@mui/material';
import { type FC, useEffect } from 'react';
import { useAppDispatch, useRouterId } from 'src/hooks';
import { MealsList } from '../../notes/components';
import { getNotes } from '../../notes/thunks';
import { getPageById } from '../thunks';
import PageContentHeader from './PageContentHeader';

const PageContent: FC = () => {
  const pageId = useRouterId('id');
  const dispatch = useAppDispatch();

  useEffect(() => {
    void Promise.allSettled([dispatch(getPageById(pageId)), dispatch(getNotes({ pageId }))]);
  }, [dispatch, pageId]);

  return (
    <>
      <PageContentHeader />
      <Container>
        <Box pb={3}>
          <MealsList />
        </Box>
      </Container>
    </>
  );
};

export default PageContent;
