/* Creates the administrator account for the /admin panel.

   Usage (on the server, from the backend folder):
     node scripts/create-admin.js admin@example.com "Admin name"

   The account is created with a random password that nobody knows — not
   even whoever runs this — so it cannot be signed in to until its owner
   sets a password: on the /admin sign-in page, "Forgot password?" sends a
   reset link to the email given here.

   It refuses an email that already belongs to a customer: the admin
   account is kept separate from any shopping account, with its own
   credentials. */

const { randomBytes } = require('crypto');
const argon2 = require('argon2');
const { PrismaClient, Role } = require('@prisma/client');

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  const name = (process.argv[3] || 'Administrator').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Give the admin email: node scripts/create-admin.js admin@example.com "Admin name"');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.role === Role.ADMIN) {
      console.log(`${email} is already an administrator. To set or change its password, use "Forgot password?" on /admin.`);
      return;
    }
    if (existing) {
      console.error(
        `${email} already belongs to a customer account. Use a different email, so the admin account has its own separate credentials.`,
      );
      process.exitCode = 1;
      return;
    }

    const passwordHash = await argon2.hash(randomBytes(48).toString('base64'), { type: argon2.argon2id });
    await prisma.user.create({
      data: { email, name, passwordHash, role: Role.ADMIN, emailVerifiedAt: new Date() },
    });
    console.log(`Administrator account created for ${email}.`);
    console.log('Next: open /admin, click "Forgot password?", and set the password from the email that arrives.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Could not create the administrator:', err.message);
  process.exit(1);
});
