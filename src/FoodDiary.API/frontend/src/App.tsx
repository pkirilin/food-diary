import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, makeStyles } from '@material-ui/core';
import Navbar from './Navbar';
import { useRoutes } from './features/__shared__/hooks';

const useStyles = makeStyles(theme => ({
  content: {
    margin: `${theme.spacing(2)}px 0`,
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const isAuthenticated = false;
  const routes = useRoutes(isAuthenticated);

  return (
    <Router>
      <Helmet>
        <title>Food diary</title>
      </Helmet>
      {isAuthenticated && <Navbar></Navbar>}
      <Container maxWidth="xl" className={classes.content}>
        {routes}
      </Container>
    </Router>
  );
};

export default App;
