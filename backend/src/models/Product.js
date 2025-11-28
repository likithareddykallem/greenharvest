import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    imageUrl: { type: String },
    gallery: [{ type: String }],
    // Optional uploaded certification files (PDF/JPG/PNG, etc.)
    certifications: [
      {
        fileUrl: String,
        fileName: String,
        mimeType: String,
      },
    ],
    certificationTags: [{ type: String }],
    categories: [{ type: String }],
    // Optional metadata such as variety, farming method, etc.
    metadata: {
      type: Map,
      of: String,
      default: undefined,
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvals: {
      approvedByAdmin: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      adminNote: { type: String },
      reviewedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);

