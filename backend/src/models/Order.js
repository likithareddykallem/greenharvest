import mongoose from 'mongoose';

const orderStates = ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Packed', 'Shipped', 'Delivered'];

const timelineSchema = new mongoose.Schema(
  {
    state: { type: String, required: true, enum: orderStates },
    note: { type: String },
    actor: { type: String },
    actorRole: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    quantity: Number,
    price: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: orderStates,
      default: 'Pending',
    },
    paymentReference: String,
    timeline: [timelineSchema],
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
export const ORDER_STATES = orderStates;

