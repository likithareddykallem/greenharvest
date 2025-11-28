import { catchAsync } from '../utils/catchAsync.js';
import {
  listProducts,
  getProduct,
  createProduct,
  approveProduct,
  updateFarmerProduct,
  resubmitFarmerProduct,
} from '../services/productService.js';
import { Taxonomy } from '../models/Taxonomy.js';

const parseMultiValue = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch (err) {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return undefined;
};

export const getProducts = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const data = await listProducts({ page, limit });
  res.json(data);
});

export const getProductById = catchAsync(async (req, res) => {
  const product = await getProduct(req.params.id);
  res.json(product);
});

export const createFarmerProduct = catchAsync(async (req, res) => {
  const { name, description, price, stock, metadata } = req.body;
  const imageFile = req.files?.image?.[0];
  const certFiles = req.files?.certifications || [];
  const galleryFiles = req.files?.gallery || [];
  const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : undefined;
  const certifications = certFiles.map((file) => ({
    fileUrl: `/uploads/${file.filename}`,
    fileName: file.originalname,
    mimeType: file.mimetype,
  }));
  const gallery = galleryFiles.map((file) => `/uploads/${file.filename}`);
  const product = await createProduct({
    name,
    description,
    price,
    stock,
    farmerId: req.user.id,
    imageUrl,
    certifications: certifications.length ? certifications : undefined,
    metadata: metadata ? JSON.parse(metadata) : undefined,
    categories: parseMultiValue(req.body.categories),
    certificationTags: parseMultiValue(req.body.certificationTags),
    gallery: gallery.length ? gallery : undefined,
  });
  res.status(201).json(product);
});

export const approveFarmerProduct = catchAsync(async (req, res) => {
  const { status = 'approved', adminNote } = req.body || {};
  const product = await approveProduct({
    productId: req.params.id,
    status,
    adminNote,
    reviewerId: req.user.id,
  });
  res.json(product);
});

export const updateFarmerProductController = catchAsync(async (req, res) => {
  const { name, description, price, stock, metadata } = req.body;
  const imageFile = req.files?.image?.[0];
  const certFiles = req.files?.certifications || [];
  const galleryFiles = req.files?.gallery || [];
  const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : undefined;
  const certifications = certFiles.map((file) => ({
    fileUrl: `/uploads/${file.filename}`,
    fileName: file.originalname,
    mimeType: file.mimetype,
  }));
  const gallery = galleryFiles.map((file) => `/uploads/${file.filename}`);

  const product = await updateFarmerProduct(req.params.id, req.user.id, {
    name,
    description,
    price,
    stock,
    imageUrl,
    certifications: certifications.length ? certifications : undefined,
    metadata: metadata ? JSON.parse(metadata) : undefined,
    categories: parseMultiValue(req.body.categories),
    certificationTags: parseMultiValue(req.body.certificationTags),
    gallery: gallery.length ? gallery : undefined,
  });

  res.json(product);
});

export const resubmitFarmerProductController = catchAsync(async (req, res) => {
  const product = await resubmitFarmerProduct(req.params.id, req.user.id);
  res.json(product);
});

export const listTaxonomyPublic = catchAsync(async (req, res) => {
  const type = req.query.type;
  const filters = type ? { type } : {};
  const items = await Taxonomy.find(filters).sort({ order: 1, label: 1 });
  res.json(items);
});

