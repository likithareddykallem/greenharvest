// backend/src/models/Order.js

const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../utils/constants');
const { generateOrderNumber } = require('../utils/helpers');

const { Schema } = mongoose;

const moneySchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true },
    name: String,
    sku: String,
    quantity: { type: Number, required: true, min: 1 },
    unit: String,
    unitPrice: moneySchema,
    subtotal: moneySchema,
    traceability: {
      batchId: String,
      lotNumber: String,
      harvestDate: Date,
    },
    metadata: Schema.Types.Mixed,
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    instructions: String,
  },
  { _id: false }
);

const timelineEventSchema = new Schema(
  {
    stage: { type: String, required: true },
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    message: String,
    metadata: Schema.Types.Mixed,
    occurredAt: { type: Date, default: Date.now },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true },
    consumer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true },
    items: [orderItemSchema],
    subtotal: moneySchema,
    tax: moneySchema,
    shippingFee: moneySchema,
    total: moneySchema,
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    deliveryWindow: {
      start: Date,
      end: Date,
    },
    fulfillmentMethod: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'delivery',
    },
    timeline: [timelineEventSchema],
    instructions: String,
    notes: String,
    metadata: Schema.Types.Mixed,
    celeryTasks: [
      {
        type: String,
        taskId: String,
        description: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('validate', function assignOrderNumber(next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  return next();
});

orderSchema.methods.addTimelineEvent = function addTimelineEvent(event) {
  this.timeline.push(event);
};

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ consumer: 1, createdAt: -1 });
orderSchema.index({ farmer: 1, status: 1 });
orderSchema.index({ status: 1, paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);

