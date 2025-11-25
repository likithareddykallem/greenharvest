// backend/src/models/Payment.js

const mongoose = require('mongoose');
const { PAYMENT_STATUS, PAYMENT_METHODS } = require('../utils/constants');

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer', 'offline'],
      default: 'stripe',
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.CARD,
    },
    intentId: { type: String, trim: true },
    chargeId: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    failureCode: String,
    failureMessage: String,
    refundedAmount: { type: Number, default: 0 },
    capturedAt: Date,
    metadata: Schema.Types.Mixed,
    auditTrail: [
      {
        event: String,
        payload: Schema.Types.Mixed,
        occurredAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ provider: 1, intentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

