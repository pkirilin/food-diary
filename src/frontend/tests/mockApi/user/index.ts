import { db } from '../db';
import data from './users.data.json';

export const fillUsers = (): void => {
  data.forEach(user => {
    db.user.create(user);
  });
};

export * as usersService from './users.service';
