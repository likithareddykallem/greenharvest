const Joi = require('joi');

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('consumer', 'farmer', 'admin').required(),
    profile: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      phone: Joi.string().optional(),
      address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        postalCode: Joi.string(),
        zipCode: Joi.string(),
        country: Joi.string()
      }).optional()
    }).required(),
    farmDetails: Joi.when('role', {
      is: 'farmer',
      then: Joi.object({
        farmName: Joi.string().required(),
        deliveryRadiusKm: Joi.number().positive().default(25),
        specialties: Joi.array().items(Joi.string()).default([]),
        farmLocation: Joi.object({
          label: Joi.string().default('Primary farm'),
          address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            country: Joi.string(),
            postalCode: Joi.string(),
            zipCode: Joi.string()
          }).optional(),
          coordinates: Joi.array().items(Joi.number()).length(2).optional(),
          acreage: Joi.number().positive().optional()
        }).optional()
      }),
      otherwise: Joi.forbidden()
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('consumer', 'farmer', 'admin').required()
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required()
  }),

  createProduct: Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().required().max(2000),
    category: Joi.string().valid(
      'vegetables', 'fruits', 'grains', 'dairy', 'herbs', 'honey', 'eggs', 'other'
    ).required(),
    price: Joi.number().positive().required(),
    unit: Joi.string().valid('kg', 'lb', 'dozen', 'bunch', 'piece', 'liter', 'gallon').required(),
    inventory: Joi.object({
      currentStock: Joi.number().min(0).required(),
      lowStockThreshold: Joi.number().min(0).default(10)
    }).required(),
    organicCertification: Joi.object({
      certified: Joi.boolean().default(true),
      certificationBody: Joi.string(),
      certificationNumber: Joi.string(),
      certificationDate: Joi.date(),
      expiryDate: Joi.date()
    }).optional()
  }),

  createOrder: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().required(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('USA'),
      deliveryInstructions: Joi.string().optional()
    }).required(),
    paymentMethod: Joi.string().valid('card', 'paypal', 'bank_transfer').required()
  })
};

// Validation middleware
exports.validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found'
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};
