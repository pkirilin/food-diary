import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { getCategories } from '../../action-creators';
import { useTypedSelector } from '../../hooks';
import CategoriesTableRow from '../CategoriesTableRow';
import { Container, Preloader, Table, TableColumn } from '../__ui__';

const columns = [
  <TableColumn key="Category name" name="Name" width="50%"></TableColumn>,
  <TableColumn key="Count products" name="Count products"></TableColumn>,
  <TableColumn key="Edit" name="" width="35px"></TableColumn>,
  <TableColumn key="Delete" name="" width="35px"></TableColumn>,
];

const CategoriesTable: React.FC = () => {
  const categories = useTypedSelector(state => state.categories.list.categoryItems);
  const dataErrorMessage = useTypedSelector(state => state.categories.list.categoryItemsFetchState.error);
  const completionStatus = useTypedSelector(state => state.categories.operations.completionStatus);
  const isLoaderVisible = useTypedSelector(state => state.categories.list.categoryItemsFetchState.loading);
  const loadingMessage = useTypedSelector(state => state.categories.list.categoryItemsFetchState.loadingMessage);
  const dispatch = useDispatch();

  useEffect(() => {
    if (completionStatus !== 'idle') {
      dispatch(getCategories());
    }
  }, [dispatch, completionStatus]);

  const rows = useMemo(
    () => categories.map(category => <CategoriesTableRow key={category.id} category={category}></CategoriesTableRow>),
    [categories],
  );

  return (
    <Container direction="column" spaceBetweenChildren="medium">
      <Preloader isVisible={isLoaderVisible} label={loadingMessage}>
        <Table columns={columns} rows={rows} dataErrorMessage={dataErrorMessage}></Table>
      </Preloader>
    </Container>
  );
};

export default CategoriesTable;
