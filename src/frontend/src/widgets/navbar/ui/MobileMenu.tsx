import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, NAV_LINKS } from '../lib';
import { APP_BAR_HEIGHT } from '@/shared/constants';

export const MobileMenu: FC = () => {
  const [isOpened, setIsOpened] = useState(false);

  const handleMenuToggle = (): void => {
    setIsOpened(isOpened => !isOpened);
  };

  return (
    <Box display={{ xs: 'flex', sm: 'none' }}>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="Open menu"
        onClick={handleMenuToggle}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        variant="temporary"
        open={isOpened}
        onClose={handleMenuToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },

          '& .MuiDrawer-paper': {
            width: '75%',
          },
        }}
      >
        <Box display="flex" gap={1}>
          <IconButton size="large" aria-label="Close menu" onClick={handleMenuToggle}>
            <CloseIcon />
          </IconButton>
          <Box display="flex" justifyContent="center" alignItems="center" height={APP_BAR_HEIGHT}>
            <Typography
              sx={theme => ({
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.fontWeightBold,
              })}
            >
              {APP_NAME}
            </Typography>
          </Box>
        </Box>
        <Divider variant="fullWidth" />
        <Box component={List} disablePadding>
          {NAV_LINKS.map(({ title, path }, index) => {
            const isSelected = location.pathname.startsWith(path);
            return (
              <ListItem key={`${index}-${title}`} disablePadding divider>
                <ListItemButton
                  component={Link}
                  to={isSelected ? '' : path}
                  selected={isSelected}
                  disableTouchRipple={isSelected}
                  sx={theme => ({
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                      pointerEvents: 'none',
                    },
                  })}
                >
                  <ListItemText primary={title} primaryTypographyProps={{ align: 'center' }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </Box>
      </Drawer>
    </Box>
  );
};
