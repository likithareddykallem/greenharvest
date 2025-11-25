// backend/src/models/Product.js

const mongoose = require('mongoose');
const { PRODUCT_CATEGORIES, PRODUCT_UNITS, PRODUCT_STATUS } = require('../utils/constants');
const { slugify } = require('../utils/helpers');

const { Schema } = mongoose;

const priceSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    unit: { type: String, enum: PRODUCT_UNITS, required: true },
    bulkTiers: [
      {
        minQuantity: Number,
        maxQuantity: Number,
        pricePerUnit: Number,
      },
    ],
  },
  { _id: false }
);

const mediaSchema = new Schema(
  {
    url: String,
    thumbnailUrl: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
    metadata: Schema.Types.Mixed,
  },
  { _id: false }
);

const traceabilitySchema = new Schema(
  {
    harvestDate: Date,
    batchId: String,
    lotNumber: String,
    storageConditions: String,
    labResultsUrl: String,
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    sku: { type: String, trim: true, unique: true },
    description: { type: String, trim: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
    tags: [{ type: String, trim: true }],
    price: priceSchema,
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.ACTIVE,
    },
    attributes: {
      variety: String,
      grade: String,
      packaging: String,
      shelfLifeDays: Number,
      organicCertification: String,
    },
    media: [mediaSchema],
    traceability: traceabilitySchema,
    certifications: [
      {
        type: String,
        certificateId: String,
        issuedBy: String,
        validUntil: Date,
      },
    ],
    inventory: {
      totalQuantity: { type: Number, default: 0 },
      reservedQuantity: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 10 },
      lastRestockedAt: Date,
    },
    visibility: {
      searchable: { type: Boolean, default: true },
      featured: { type: Boolean, default: false },
      seasonal: { type: Boolean, default: false },
    },
    analytics: {
      views: { type: Number, default: 0 },
      favorites: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

productSchema.pre('save', function setSlug(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(`${this.name}-${this._id || ''}`);
  }
  return next();
});

productSchema.virtual('availableQuantity').get(function availableQuantity() {
  return Math.max(0, this.inventory.totalQuantity - this.inventory.reservedQuantity);
});

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);

