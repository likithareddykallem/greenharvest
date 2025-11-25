// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES, USER_STATUS } = require('../utils/constants');

const { Schema } = mongoose;
const SALT_ROUNDS = 10;

const addressSchema = new Schema(
  {
    label: { type: String, trim: true },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const verificationSchema = new Schema(
  {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    documentsVerified: { type: Boolean, default: false },
    lastReviewedAt: Date,
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CONSUMER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    phone: { type: String, trim: true },
    avatarUrl: String,
    profile: { type: Schema.Types.ObjectId, ref: 'FarmerProfile' },
    addresses: [addressSchema],
    verification: verificationSchema,
    preferences: {
      locale: { type: String, default: 'en-US' },
      currency: { type: String, default: 'USD' },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: false },
      },
    },
    refreshToken: { type: String, select: false },
    passwordChangedAt: Date,
    lastLoginAt: Date,
    metadata: {
      device: String,
      ip: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    status: this.status,
    phone: this.phone,
    avatarUrl: this.avatarUrl,
    verification: this.verification,
    preferences: this.preferences,
    profile: this.profile,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);

