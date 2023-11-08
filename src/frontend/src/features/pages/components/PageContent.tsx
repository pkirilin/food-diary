import { Box, Container } from '@mui/material';
import React, { useEffect } from 'react';
import { useAppDispatch, useRouterId } from 'src/hooks';
import { MealsList } from '../../notes/components';
import { getNotes } from '../../notes/thunks';
import { getPageById } from '../thunks';
import PageContentHeader from './PageContentHeader';

const PageContent: React.FC = () => {
  const pageId = useRouterId('id');
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getPageById(pageId));
    dispatch(getNotes({ pageId }));
  }, [dispatch, pageId]);

  return (
    <Container>
      <Box py={3}>
        <PageContentHeader />
        <MealsList />
      </Box>
    </Container>
  );
};

export default PageContent;
