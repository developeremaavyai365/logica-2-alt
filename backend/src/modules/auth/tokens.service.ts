import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID, createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  sessionId: string;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

/** Everything about issuing, rotating, and revoking tokens lives here so
 *  the rest of the auth flow never touches raw crypto directly.
 *
 *  Access tokens: RS256-signed JWTs, short-lived (15m default). Only the
 *  private key (held by this service) can mint them; anything that only
 *  needs to verify can do so with the public key alone.
 *
 *  Refresh tokens: opaque random values, NOT JWTs. Only a SHA-256 hash is
 *  ever stored — the raw value exists only in the httpOnly cookie on the
 *  client and briefly in memory here. Each refresh rotates the token:
 *  the old row is marked revoked and points at its replacement via
 *  `replacedBy`. If a revoked token is ever presented again, that's
 *  reuse of a stolen/old token — the entire token family is killed. */
@Injectable()
export class TokensService {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Two ways to supply the keypair: raw PEM content in JWT_PRIVATE_KEY/
    // JWT_PUBLIC_KEY env vars (for deploy targets with no persistent
    // filesystem to keep a gitignored keys/ directory on — set the env var
    // to the file's contents, with \n for line breaks if your host
    // doesn't support real multi-line values), or local files via
    // JWT_PRIVATE_KEY_PATH/JWT_PUBLIC_KEY_PATH (what `npm run
    // keys:generate` produces, for local dev). Env content wins if both
    // are present.
    const privateKeyEnv = this.config.get<string>('JWT_PRIVATE_KEY');
    const publicKeyEnv = this.config.get<string>('JWT_PUBLIC_KEY');

    if (privateKeyEnv && publicKeyEnv) {
      this.privateKey = privateKeyEnv.replace(/\\n/g, '\n');
      this.publicKey = publicKeyEnv.replace(/\\n/g, '\n');
    } else {
      const cwd = process.cwd();
      this.privateKey = readFileSync(join(cwd, this.config.getOrThrow('JWT_PRIVATE_KEY_PATH')), 'utf8');
      this.publicKey = readFileSync(join(cwd, this.config.getOrThrow('JWT_PUBLIC_KEY_PATH')), 'utf8');
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  signAccessToken(payload: AccessTokenPayload): string {
    return this.jwt.sign(payload, {
      algorithm: 'RS256',
      privateKey: this.privateKey,
      expiresIn: this.config.get<string>('JWT_ACCESS_TOKEN_TTL') ?? '15m',
    });
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  /** Issues a brand-new access + refresh pair, starting a new rotation family. */
  async issueTokenPair(
    userId: string,
    role: Role,
    meta: { userAgent?: string; ipAddress?: string },
  ): Promise<IssuedTokens> {
    const familyId = randomUUID();
    return this.mintRefresh(userId, role, familyId, meta);
  }

  /** Rotates a refresh token: validates it, revokes it, and issues a new
   *  pair in the same family. Throws if the token is invalid, expired,
   *  or already-revoked (the reuse-detection case) — on reuse, the whole
   *  family is revoked so every session descended from the stolen token
   *  dies, not just this one. */
  async rotateRefreshToken(rawToken: string, meta: { userAgent?: string; ipAddress?: string }): Promise<IssuedTokens> {
    const tokenHash = this.hashToken(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (existing.revoked) {
      // Reuse of a rotated-out token — treat as compromise.
      await this.prisma.refreshToken.updateMany({
        where: { familyId: existing.familyId, revoked: false },
        data: { revoked: true },
      });
      throw new UnauthorizedException('Refresh token reuse detected — all sessions revoked.');
    }

    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: existing.userId } });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Account no longer active.');
    }

    const issued = await this.mintRefresh(user.id, user.role, existing.familyId, meta);

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revoked: true },
    });

    return issued;
  }

  private async mintRefresh(
    userId: string,
    role: Role,
    familyId: string,
    meta: { userAgent?: string; ipAddress?: string },
  ): Promise<IssuedTokens> {
    const raw = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(raw);
    const ttlDays = this.config.get<number>('JWT_REFRESH_TOKEN_TTL_DAYS') ?? 30;
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    const row = await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        familyId,
        expiresAt,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    });

    // Update the token this one replaced, if rotating (not the first issue).
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revoked: true, replacedBy: null, NOT: { id: row.id } },
      data: { replacedBy: row.id },
    });

    const accessToken = this.signAccessToken({ sub: userId, role, sessionId: familyId });
    return { accessToken, refreshToken: raw, refreshTokenExpiresAt: expiresAt };
  }

  /** Logout: revoke this one refresh token (and only this one — other
   *  devices/sessions stay logged in, matching normal e-commerce UX). */
  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  /** Revokes every session for a user — used on password reset/compromise. */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}
