import { List } from '@mui/material';
import { Box } from '@mui/system';
import { type FC } from 'react';
import { NAV_LINKS } from '../../lib';
import { MenuListItem } from './MenuListItem';

export const MenuList: FC = () => (
  <Box component={List} disablePadding>
    {NAV_LINKS.map(({ title, path }, index) => (
      <MenuListItem key={`${index}-${title}`} title={title} path={path} />
    ))}
  </Box>
);
