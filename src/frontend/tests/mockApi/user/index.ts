import { db } from '../db';
import data from './users.data.json';
import { FAKE_AUTH_LOGIN_ON_INIT } from '@/config';

export const fillUsers = (): void => {
  data.forEach(user => {
    db.user.create({
      ...user,
      isAuthenticated: FAKE_AUTH_LOGIN_ON_INIT ? true : user.isAuthenticated,
    });
  });
};

export * as usersService from './users.service';
