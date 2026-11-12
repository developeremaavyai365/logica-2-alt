import * as argon2 from 'argon2';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';

/* The shop and the admin panel each have their own sign-in, and each
   refuses the other's accounts — so the administrator never shares
   credentials with a shopping account. */

const PASSWORD = 'Correct-Horse-9!';

async function setup(role: Role) {
  const user = {
    id: 'u1',
    email: 'someone@example.com',
    phone: null,
    passwordHash: await argon2.hash(PASSWORD, { type: argon2.argon2id }),
    role,
    emailVerifiedAt: new Date(),
    failedLoginCount: 0,
    lockedUntil: null,
    deletedAt: null,
  };
  const prisma = {
    user: {
      findFirst: async () => user,
      update: async ({ data }: { data: Partial<typeof user> }) => Object.assign(user, data),
    },
  };
  const tokens = { issueTokenPair: async () => ({ accessToken: 'access', refreshToken: 'refresh', refreshTokenExpiresAt: new Date() }) };
  const config = { get: () => undefined };
  const service = new AuthService(prisma as never, tokens as never, {} as never, config as never);
  return { service, user };
}

const login = (service: AuthService, door: 'shop' | 'admin', password = PASSWORD) =>
  service.login({ identifier: 'someone@example.com', password }, {}, door);

describe('sign-in doors', () => {
  it('lets an administrator in through the admin sign-in', async () => {
    const { service } = await setup(Role.ADMIN);
    await expect(login(service, 'admin')).resolves.toMatchObject({ accessToken: 'access' });
  });

  it('refuses the administrator at the shop sign-in and points to /admin', async () => {
    const { service } = await setup(Role.ADMIN);
    await expect(login(service, 'shop')).rejects.toThrow(/Sign in at \/admin/);
  });

  it('answers a customer at the admin sign-in exactly like a wrong password', async () => {
    const { service, user } = await setup(Role.CUSTOMER);
    const customer = await login(service, 'admin').catch((e) => e);
    const wrong = await login(service, 'admin', 'nope').catch((e) => e);
    expect(customer).toBeInstanceOf(UnauthorizedException);
    expect(customer.message).toBe(wrong.message);
    // The customer's correct password is not counted as a failed attempt.
    expect(user.failedLoginCount).toBe(1);
  });

  it('still lets customers sign in to the shop', async () => {
    const { service } = await setup(Role.CUSTOMER);
    await expect(login(service, 'shop')).resolves.toMatchObject({ accessToken: 'access' });
  });
});
