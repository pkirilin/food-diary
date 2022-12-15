import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../constants';

const Menu: React.FC = () => {
  return (
    <Box component={List} disablePadding display={{ xs: 'none', sm: 'flex' }} gap={1}>
      {NAV_LINKS.map(({ title, path, isRoot }, index) => {
        const matchesRootPath = isRoot && location.pathname === '/';
        const isSelected = location.pathname.startsWith(path) || matchesRootPath;
        return (
          <ListItem key={`${index}-${title}`} disableGutters>
            <ListItemButton
              href={isSelected ? '' : path}
              LinkComponent={Link}
              selected={isSelected}
              disableRipple={isSelected}
              disableTouchRipple={isSelected}
              sx={theme => ({
                borderRadius: theme.shape.borderRadius,

                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  pointerEvents: 'none',
                },
              })}
            >
              <ListItemText
                primary={title}
                primaryTypographyProps={{
                  sx: theme => ({ fontWeight: theme.typography.fontWeightBold }),
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </Box>
  );
};

export default Menu;
