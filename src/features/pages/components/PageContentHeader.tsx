import React from 'react';
import { Typography } from '@material-ui/core';

const pageDate = new Date('2020-01-10');

const PageContentHeader: React.FC = () => {
  return <Typography variant="h1">{pageDate.toLocaleDateString()}</Typography>;
};

export default PageContentHeader;
