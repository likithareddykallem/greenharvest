import mongoose from 'mongoose';

const taxonomySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['category', 'certification'], required: true },
    label: { type: String, required: true },
    description: { type: String },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taxonomySchema.index({ type: 1, label: 1 }, { unique: true });

export const Taxonomy = mongoose.model('Taxonomy', taxonomySchema);






