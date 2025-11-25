export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
};

export type BulkPricingTier = {
  minQuantity?: number;
  maxQuantity?: number;
  pricePerUnit?: number;
};

export type ProductPrice = {
  amount?: number;
  currency?: string;
  unit?: string;
  bulkTiers?: BulkPricingTier[];
};

export type MediaAsset = {
  url?: string;
  thumbnailUrl?: string;
  alt?: string;
  isPrimary?: boolean;
  metadata?: Record<string, unknown>;
};

export type TraceabilityInfo = {
  harvestDate?: string;
  batchId?: string;
  lotNumber?: string;
  storageConditions?: string;
  labResultsUrl?: string;
};

export type ProductCertification = {
  type?: string;
  certificateId?: string;
  issuedBy?: string;
  validUntil?: string;
};

export type ProductInventory = {
  totalQuantity?: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  lastRestockedAt?: string;
};

export type FarmerLocation = {
  label?: string;
  acreage?: number;
  defaultPickup?: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
};

export type FarmerCertification = {
  type?: string;
  certificationId?: string;
  issuingBody?: string;
  validFrom?: string;
  validTo?: string;
  status?: string;
};

export type FarmerProfile = {
  _id: string;
  farmName?: string;
  slug?: string;
  tagline?: string;
  about?: string;
  website?: string;
  phone?: string;
  supportEmail?: string;
  heroImage?: string;
  gallery?: string[];
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  certifications?: FarmerCertification[];
  locations?: FarmerLocation[];
  fulfillment?: {
    deliveryRadiusKm?: number;
    coldChainCapable?: boolean;
    processingFacilities?: boolean;
  };
  avgRating?: number;
  totalReviews?: number;
  totalOrdersFulfilled?: number;
  preferredCurrencies?: string[];
  tags?: string[];
};

export type UserRole = 'consumer' | 'farmer' | 'admin';

export type Address = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  zipCode?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: string;
  phone?: string;
  avatarUrl?: string;
  verification?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  profile?: FarmerProfile;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthSession = {
  user: User;
  tokens: AuthTokens;
  redirectPath?: string;
};

export type Product = {
  _id: string;
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  category?: string;
  tags?: string[];
  price?: ProductPrice;
  status?: string;
  attributes?: {
    variety?: string;
    grade?: string;
    packaging?: string;
    shelfLifeDays?: number;
    organicCertification?: string;
  };
  media?: MediaAsset[];
  traceability?: TraceabilityInfo;
  certifications?: ProductCertification[];
  inventory?: ProductInventory;
  visibility?: {
    searchable?: boolean;
    featured?: boolean;
    seasonal?: boolean;
  };
  analytics?: {
    views?: number;
    favorites?: number;
    conversions?: number;
  };
  farmer?: FarmerProfile;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type Review = {
  id: string;
  productId: string;
  customer: string;
  title: string;
  body: string;
  rating: number;
  createdAt: string;
  badges: string[];
};

export type PaymentGateway = {
  id: string;
  label: string;
  status: string;
  features: string[];
};

export type ShowcaseFarmer = {
  id: string;
  name: string;
  location: string;
  heroImage: string;
  avatar: string;
  certifications: string[];
  story: string;
  specialties: string[];
  fulfillmentStats: {
    onTimeRate: number;
    sustainabilityScore: number;
    avgLeadTimeDays: number;
  };
  logisticsPartners: string[];
  contact: {
    email: string;
    phone: string;
    site?: string;
  };
  social: {
    instagram?: string;
    linkedin?: string;
  };
};

export type FarmerOrder = {
  id: string;
  buyer: string;
  status: 'Processing' | 'Ready for pickup' | 'Shipped' | 'Delivered';
  value: number;
  items: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  destination: string;
  expectedShip: string;
};

export type PlatformOrder = {
  id: string;
  status: 'Processing' | 'Fulfilled' | 'In transit' | 'Delivered';
  customer: string;
  total: number;
  eta: string;
  checkpoints: {
    label: string;
    detail: string;
    timestamp: string;
    completed: boolean;
  }[];
};


