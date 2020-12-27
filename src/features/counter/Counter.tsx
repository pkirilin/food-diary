import React from 'react';
import { Button, Typography } from '@material-ui/core';
import { useTypedSelector } from '../__shared__/hooks';
import { useDispatch } from 'react-redux';
import { increment } from '../counter/slice';

const Counter: React.FC = () => {
  const counterValue = useTypedSelector(state => state.counter.value);
  const dispatch = useDispatch();

  const handleIncrement = (): void => {
    dispatch(increment());
  };

  return (
    <React.Fragment>
      <Typography variant="h1" gutterBottom>
        Counter
      </Typography>
      <Typography variant="h2" gutterBottom>
        Current count: {counterValue}
      </Typography>
      <Button variant="outlined" onClick={handleIncrement}>
        Increment
      </Button>
    </React.Fragment>
  );
};

export default Counter;
