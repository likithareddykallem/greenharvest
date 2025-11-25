// backend/src/services/authService.js
const mongoose = require('mongoose');
const { User, FarmerProfile } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  blacklistAccessToken,
} = require('../utils/token');
const cache = require('../utils/cache');
const { CACHE_TTL, USER_ROLES } = require('../utils/constants');

const cacheKey = (id) => `user:${id}`;

const dashboardRoutes = {
  [USER_ROLES.ADMIN]: '/dashboard',
  [USER_ROLES.FARMER]: '/farmer/portal',
  [USER_ROLES.CONSUMER]: '/catalog',
};

const normalizeRole = (roleInput) => {
  const role = String(roleInput || '').toLowerCase();
  if (!Object.values(USER_ROLES).includes(role)) {
    const err = new Error('Invalid role selected');
    err.status = 400;
    throw err;
  }
  return role;
};

const mapAddressPayload = (address) => {
  if (!address) return undefined;
  return {
    street: address.street,
    city: address.city,
    state: address.state,
    country: address.country,
    postalCode: address.postalCode || address.zipCode,
  };
};

const getDashboardRoute = (role) => dashboardRoutes[role] || '/';

const registerUser = async (payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, password, role, profile, farmDetails } = payload;
    const normalizedRole = normalizeRole(role);

    if (!profile?.firstName || !profile?.lastName) {
      const err = new Error('First name and last name are required');
      err.status = 400;
      throw err;
    }

    const primaryAddress = mapAddressPayload(profile.address);

    const user = await User.create(
      [
        {
          email,
          password,
          role: normalizedRole,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          addresses: primaryAddress ? [primaryAddress] : [],
        },
      ],
      { session }
    );

    const createdUser = user[0];

    if (normalizedRole === USER_ROLES.FARMER && farmDetails) {
      const locationAddress = mapAddressPayload(farmDetails.farmLocation?.address);
      const coordinates = farmDetails.farmLocation?.coordinates;
      const locationPayload = farmDetails.farmLocation
        ? {
            label: farmDetails.farmLocation.label || 'Primary farm',
            address: locationAddress,
            coordinates: coordinates
              ? { lat: coordinates[0], lng: coordinates[1] }
              : undefined,
            acreage: farmDetails.farmLocation.acreage,
            defaultPickup: true,
          }
        : undefined;

      const farmerProfile = await FarmerProfile.create(
        [
          {
            user: createdUser._id,
            farmName: farmDetails.farmName,
            locations: locationPayload ? [locationPayload] : [],
            tags: farmDetails.specialties || [],
            fulfillment: {
              deliveryRadiusKm: farmDetails.deliveryRadiusKm || 25,
            },
          },
        ],
        { session }
      );

      createdUser.profile = farmerProfile[0]._id;
      await createdUser.save({ session });
    }

    await session.commitTransaction();
    await createdUser.populate('profile');
    return {
      user: createdUser.toPublicJSON(),
      redirectPath: getDashboardRoute(normalizedRole),
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const loginUser = async ({ email, password, role }) => {
  const normalizedRole = normalizeRole(role);
  const user = await User.findOne({ email }).select('+password').populate('profile');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  if (user.role !== normalizedRole) {
    const err = new Error('Role mismatch for this account');
    err.status = 403;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const access = generateAccessToken({ id: user._id, role: user.role });
  const refresh = generateRefreshToken({ id: user._id });

  user.refreshToken = refresh.token;
  user.lastLoginAt = new Date();
  await user.save();

  await cache.set(cacheKey(user._id), user.toPublicJSON(), CACHE_TTL.USER_SESSION);

  const redirectPath = getDashboardRoute(user.role);

  return {
    user: user.toPublicJSON(),
    tokens: {
      accessToken: access.token,
      refreshToken: refresh.token,
    },
    redirectPath,
  };
};

const refreshSession = async (token) => {
  if (!token) {
    const err = new Error('Refresh token required');
    err.status = 400;
    throw err;
  }
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  const access = generateAccessToken({ id: user._id, role: user.role });
  const refresh = generateRefreshToken({ id: user._id });
  user.refreshToken = refresh.token;
  await user.save();

  await cache.set(cacheKey(user._id), user.toPublicJSON(), CACHE_TTL.USER_SESSION);

  return {
    user: user.toPublicJSON(),
    tokens: {
      accessToken: access.token,
      refreshToken: refresh.token,
    },
    redirectPath: getDashboardRoute(user.role),
  };
};

const logoutUser = async (userId, jti) => {
  if (jti) {
    await blacklistAccessToken(jti);
  }
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  await cache.del(cacheKey(userId));
};

const getCurrentUser = async (userId) => {
  const cached = await cache.get(cacheKey(userId));
  if (cached) return cached;
  const user = await User.findById(userId).populate('profile');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const publicUser = user.toPublicJSON();
  await cache.set(cacheKey(userId), publicUser, CACHE_TTL.USER_SESSION);
  return publicUser;
};

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
  getCurrentUser,
};

