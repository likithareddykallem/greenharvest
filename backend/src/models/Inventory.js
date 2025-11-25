// backend/src/models/Inventory.js

const mongoose = require('mongoose');
const { DEFAULT_LOW_STOCK_THRESHOLD } = require('../utils/constants');

const { Schema } = mongoose;

const warehouseSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, trim: true },
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
    temperatureControlled: { type: Boolean, default: false },
  },
  { _id: false }
);

const inventorySchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true },
    totalQuantity: { type: Number, default: 0 },
    reservedQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: DEFAULT_LOW_STOCK_THRESHOLD },
    batchLocks: [
      {
        lockId: String,
        quantity: Number,
        expiresAt: Date,
      },
    ],
    warehouses: [warehouseSchema],
    restockHistory: [
      {
        quantity: Number,
        note: String,
        restockedAt: { type: Date, default: Date.now },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

inventorySchema.virtual('availableQuantity').get(function availableQuantity() {
  return Math.max(0, this.totalQuantity - this.reservedQuantity);
});

inventorySchema.methods.reserve = function reserve(quantity) {
  if (quantity <= 0) return false;
  if (this.availableQuantity < quantity) return false;
  this.reservedQuantity += quantity;
  return true;
};

inventorySchema.methods.release = function release(quantity) {
  if (quantity <= 0) return false;
  this.reservedQuantity = Math.max(0, this.reservedQuantity - quantity);
  return true;
};

inventorySchema.index({ farmer: 1 });
inventorySchema.index({ product: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);

