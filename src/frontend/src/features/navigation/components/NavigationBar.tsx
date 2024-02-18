import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Container, IconButton, Toolbar, Tooltip } from '@mui/material';
import { type FC } from 'react';
import { Form } from 'react-router-dom';
import { APP_BAR_HEIGHT } from 'src/constants';
import { APP_NAME } from '../constants';
import BrandLink from './BrandLink';
import Menu from './Menu';
import MobileMenu from './MobileMenu';

const NavigationBar: FC = () => (
  <AppBar component="nav" position="sticky">
    <Container>
      <Box component={Toolbar} disableGutters display="flex" gap={1} height={APP_BAR_HEIGHT}>
        <MobileMenu />
        <Box display="flex" justifyContent="space-between" gap={2} flexGrow={1}>
          <Box display="flex" alignItems="center" gap={4}>
            <BrandLink to="/" sx={theme => ({ color: theme.palette.primary.contrastText })}>
              {APP_NAME}
            </BrandLink>
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

export default NavigationBar;
