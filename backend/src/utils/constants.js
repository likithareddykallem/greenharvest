// ============================================
// backend/src/utils/constants.js
// Application constants
// ============================================

module.exports = {
  // User roles
  USER_ROLES: {
    CONSUMER: 'consumer',
    FARMER: 'farmer',
    ADMIN: 'admin'
  },

  // User status
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  },

  // Product categories
  PRODUCT_CATEGORIES: [
    'vegetables',
    'fruits',
    'grains',
    'dairy',
    'herbs',
    'honey',
    'eggs',
    'meat',
    'nuts',
    'seeds',
    'other'
  ],

  // Product units
  PRODUCT_UNITS: [
    'kg',
    'lb',
    'oz',
    'g',
    'dozen',
    'bunch',
    'piece',
    'liter',
    'gallon',
    'pint',
    'quart'
  ],

  // Product status
  PRODUCT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OUT_OF_STOCK: 'out_of_stock',
    DISCONTINUED: 'discontinued'
  },

  // Order status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    PACKED: 'packed',
    SHIPPED: 'shipped',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },

  // Payment status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // Payment methods
  PAYMENT_METHODS: {
    CARD: 'card',
    PAYPAL: 'paypal',
    BANK_TRANSFER: 'bank_transfer'
  },

  // Certification types
  CERTIFICATION_TYPES: [
    'USDA_Organic',
    'EU_Organic',
    'Certified_Naturally_Grown',
    'Biodynamic',
    'Fair_Trade',
    'Rainforest_Alliance',
    'Non_GMO',
    'Animal_Welfare_Approved',
    'Other'
  ],

  // Supply chain stages
  SUPPLY_CHAIN_STAGES: [
    'order_placed',
    'confirmed',
    'harvested',
    'quality_checked',
    'packed',
    'shipped',
    'in_transit',
    'out_for_delivery',
    'delivered'
  ],

  // Cache TTL (seconds)
  CACHE_TTL: {
    PRODUCTS: 3600,        // 1 hour
    PRODUCT_DETAIL: 1800,  // 30 minutes
    FARMERS: 7200,         // 2 hours
    PROMOTIONS: 1800,      // 30 minutes
    CATEGORIES: 86400,     // 24 hours
    USER_SESSION: 86400,   // 24 hours
    INVENTORY: 60,         // 1 minute (dynamic)
    SEARCH_RESULTS: 600,   // 10 minutes
    CART: 3600            // 1 hour
  },

  // Image sizes for processing
  IMAGE_SIZES: {
    THUMBNAIL: { width: 150, height: 150 },
    SMALL: { width: 300, height: 300 },
    MEDIUM: { width: 600, height: 600 },
    LARGE: { width: 1200, height: 1200 }
  },

  // Celery queue names
  CELERY_QUEUES: {
    IMAGE_PROCESSING: 'image_processing',
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics',
    INVENTORY_ALERTS: 'inventory_alerts',
    REPORTS: 'reports'
  },

  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Inventory
  DEFAULT_LOW_STOCK_THRESHOLD: 10,
  INVENTORY_LOCK_TIMEOUT: 30000, // 30 seconds

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    AUTH_MAX: 5
  }
};