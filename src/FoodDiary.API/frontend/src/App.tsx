import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Container } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Navbar from './Navbar';
import { AppRoutes } from './routes';
import { useAuth } from './features/auth/hooks';

const useStyles = makeStyles(theme => ({
  content: {
    margin: `${theme.spacing(2)} 0`,
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const { isAuthenticated } = useAuth();

  return (
    <Fragment>
      <Helmet>
        <title>Food diary</title>
      </Helmet>
      {isAuthenticated && <Navbar />}
      <Container maxWidth={false} className={classes.content}>
        <AppRoutes />
      </Container>
    </Fragment>
  );
};

export default App;
