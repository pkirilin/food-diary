import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Container, IconButton, Link, Toolbar, Tooltip } from '@mui/material';
import { type FC } from 'react';
import { Form, Link as RouterLink } from 'react-router-dom';
import { APP_NAME } from '../lib';
import { Menu } from './Menu';
import { MobileMenu } from './MobileMenu';
import { APP_BAR_HEIGHT } from '@/shared/constants';

export const NavigationBar: FC = () => (
  <AppBar component="nav" position="sticky">
    <Container>
      <Box component={Toolbar} disableGutters display="flex" gap={1} height={APP_BAR_HEIGHT}>
        <MobileMenu />
        <Box display="flex" justifyContent="space-between" gap={2} flexGrow={1}>
          <Box display="flex" alignItems="center" gap={4}>
            <Link
              component={RouterLink}
              to="/"
              sx={theme => ({
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.fontWeightBold,
                color: theme.palette.primary.contrastText,
                textDecoration: 'none',
              })}
            >
              {APP_NAME}
            </Link>
            <Menu />
          </Box>
          <Box component={Form} display="flex" method="post" action="/logout">
            <Tooltip title="Logout">
              <IconButton type="submit" size="large" edge="end" aria-label="Logout">
                <LogoutIcon sx={theme => ({ fill: theme.palette.primary.contrastText })} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Container>
  </AppBar>
);
