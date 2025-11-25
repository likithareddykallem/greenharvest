// backend/src/models/FarmerProfile.js

const mongoose = require('mongoose');
const { slugify } = require('../utils/helpers');

const { Schema } = mongoose;

const certificationSchema = new Schema(
  {
    type: { type: String, required: true, trim: true },
    certificationId: { type: String, trim: true },
    issuingBody: { type: String, trim: true },
    validFrom: Date,
    validTo: Date,
    documents: [
      {
        label: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'verified', 'expired', 'revoked'],
      default: 'pending',
    },
    metadata: Schema.Types.Mixed,
  },
  { _id: false, timestamps: true }
);

const locationSchema = new Schema(
  {
    label: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    acreage: Number,
    facilities: [String],
    defaultPickup: { type: Boolean, default: false },
  },
  { _id: false }
);

const farmerProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    farmName: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    tagline: { type: String, trim: true },
    about: String,
    website: String,
    phone: String,
    supportEmail: String,
    heroImage: String,
    gallery: [String],
    social: {
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String,
    },
    certifications: [certificationSchema],
    locations: [locationSchema],
    fulfillment: {
      deliveryRadiusKm: { type: Number, default: 25 },
      coldChainCapable: { type: Boolean, default: false },
      processingFacilities: { type: Boolean, default: false },
    },
    avgRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalOrdersFulfilled: { type: Number, default: 0 },
    preferredCurrencies: [{ type: String, default: 'USD' }],
    tags: [String],
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'active', 'suspended'],
      default: 'pending_review',
    },
    lastReviewedAt: Date,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

farmerProfileSchema.pre('save', function generateSlug(next) {
  if (!this.isModified('farmName')) {
    return next();
  }
  this.slug = slugify(`${this.farmName}-${this._id}`);
  return next();
});

farmerProfileSchema.index({ slug: 1 }, { unique: true });
farmerProfileSchema.index({ status: 1, avgRating: -1 });
farmerProfileSchema.index({ tags: 1 });

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);

