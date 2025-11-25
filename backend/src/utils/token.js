// backend/src/utils/token.js

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');
const { parseDurationToSeconds } = require('./helpers');
const { redisClient } = require('../config/redis');

const ACCESS_BLACKLIST_PREFIX = 'blacklist:';

const signToken = (payload, secret, expiresIn) => {
  const jti = uuidv4();
  const token = jwt.sign({ ...payload, jti }, secret, { expiresIn });
  return { token, jti };
};

const generateAccessToken = (payload) => signToken(payload, config.auth.jwt.secret, config.auth.jwt.expiresIn);
const generateRefreshToken = (payload) =>
  signToken(payload, config.auth.refresh.secret, config.auth.refresh.expiresIn);

const verifyAccessToken = (token) => jwt.verify(token, config.auth.jwt.secret);
const verifyRefreshToken = (token) => jwt.verify(token, config.auth.refresh.secret);

const blacklistAccessToken = async (jti) => {
  const ttl = parseDurationToSeconds(config.auth.jwt.expiresIn, 3600);
  await redisClient.set(`${ACCESS_BLACKLIST_PREFIX}${jti}`, '1', { EX: ttl });
};

const isAccessTokenBlacklisted = (jti) => redisClient.get(`${ACCESS_BLACKLIST_PREFIX}${jti}`);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistAccessToken,
  isAccessTokenBlacklisted,
};

