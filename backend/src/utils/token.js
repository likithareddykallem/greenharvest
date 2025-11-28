import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { redis } from '../config/redis.js';
import { randomUUID } from 'crypto';

const REFRESH_PREFIX = 'refresh-token:';

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl });

export const signRefreshToken = async (payload) => {
  const tokenId = randomUUID();
  const token = jwt.sign({ ...payload, tokenId }, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenTtl,
  });
  const key = `${REFRESH_PREFIX}${tokenId}`;
  const ttlSeconds = 60 * 60 * 24 * 7;
  await redis.set(key, JSON.stringify(payload), 'EX', ttlSeconds);
  return token;
};

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = async (token) => {
  const decoded = jwt.verify(token, env.jwtRefreshSecret);
  const key = `${REFRESH_PREFIX}${decoded.tokenId}`;
  const exists = await redis.get(key);
  if (!exists) {
    throw new Error('Refresh token revoked');
  }
  return decoded;
};

export const revokeRefreshToken = async (tokenId) => {
  await redis.del(`${REFRESH_PREFIX}${tokenId}`);
};

