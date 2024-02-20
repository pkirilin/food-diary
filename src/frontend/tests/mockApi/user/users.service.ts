import { type DbUser, db } from '../db';

export const findById = (id: number): DbUser | null =>
  db.user.findFirst({
    where: { id: { equals: id } },
  });

export const signInById = (id: number): void => {
  db.user.update({
    where: { id: { equals: id } },
    data: { isAuthenticated: true },
  });
};

export const signOutById = (id: number): void => {
  db.user.update({
    where: { id: { equals: id } },
    data: { isAuthenticated: false },
  });
};
