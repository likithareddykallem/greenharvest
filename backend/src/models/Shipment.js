// backend/src/models/Shipment.js

const mongoose = require('mongoose');
const { SUPPLY_CHAIN_STAGES } = require('../utils/constants');

const { Schema } = mongoose;

const checkpointSchema = new Schema(
  {
    stage: { type: String, enum: SUPPLY_CHAIN_STAGES, required: true },
    status: { type: String, trim: true },
    location: {
      label: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    temperature: Number,
    humidity: Number,
    note: String,
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const shipmentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    carrier: { type: String, trim: true },
    serviceLevel: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: SUPPLY_CHAIN_STAGES,
      default: 'order_placed',
    },
    checkpoints: [checkpointSchema],
    estimatedDelivery: Date,
    actualDelivery: Date,
    proofOfDeliveryUrl: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

shipmentSchema.index({ trackingNumber: 1 }, { unique: true, sparse: true });
shipmentSchema.index({ status: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);

