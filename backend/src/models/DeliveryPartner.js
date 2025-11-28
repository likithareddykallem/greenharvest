import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    zone: { type: String, default: 'general' },
    active: { type: Boolean, default: true },
    assignments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);

