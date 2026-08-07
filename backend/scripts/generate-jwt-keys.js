/* Generates an RS256 keypair for signing/verifying access tokens.
 * Run once per environment: `npm run keys:generate`.
 * The private key must only ever live on the auth-issuing service;
 * the public key can be distributed freely to anything that only verifies. */
const { generateKeyPairSync } = require('crypto');
const { mkdirSync, writeFileSync, existsSync } = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, '..', 'keys');
if (!existsSync(keysDir)) mkdirSync(keysDir, { recursive: true });

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

writeFileSync(path.join(keysDir, 'jwt-private.pem'), privateKey);
writeFileSync(path.join(keysDir, 'jwt-public.pem'), publicKey);

console.log('Generated keys/jwt-private.pem and keys/jwt-public.pem');
console.log('These are gitignored — never commit them. Back the private key up securely.');
