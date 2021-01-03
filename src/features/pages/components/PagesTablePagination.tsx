import React from 'react';
import { TablePagination } from '@material-ui/core';

const PagesTablePagination: React.FC = () => {
  const noop = () => {
    return;
  };

  return (
    <TablePagination component="div" count={100} rowsPerPage={10} page={0} onChangePage={noop} />
  );
};

export default PagesTablePagination;
