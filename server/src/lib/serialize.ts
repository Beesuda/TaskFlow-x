import type { User } from '@prisma/client';

// Strip the password hash before sending a user over the wire.
export type PublicUser = Omit<User, 'password'>;

export function publicUser(user: User): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}
