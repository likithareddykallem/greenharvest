import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const roles = ['customer', 'farmer', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: roles, default: 'customer' },
    approved: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    profile: {
      farmName: { type: String },
      location: { type: String },
      phone: { type: String },
      bio: { type: String },
      certifications: [{ type: String }],
      payoutPreference: { type: String },
      links: {
        website: { type: String },
        instagram: { type: String },
      },
      newsletterOptIn: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
export const USER_ROLES = roles;

