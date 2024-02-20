import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../lib';

export const Menu: FC = () => {
  const location = useLocation();

  return (
    <Box component={List} disablePadding display={{ xs: 'none', sm: 'flex' }} gap={1}>
      {NAV_LINKS.map(({ title, path, isRoot }, index) => {
        const matchesRootPath = isRoot && location.pathname === '/';
        const isSelected = location.pathname.startsWith(path) || matchesRootPath;
        return (
          <ListItem key={`${index}-${title}`} disableGutters>
            <ListItemButton
              component={Link}
              to={isSelected ? '' : path}
              selected={isSelected}
              disableRipple={isSelected}
              disableTouchRipple={isSelected}
              sx={theme => ({
                borderRadius: theme.shape.borderRadius,
                color: theme.palette.grey[300],

                '&.Mui-selected': {
                  color: theme.palette.primary.contrastText,
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
