// backend/src/models/index.js
// Central export for Mongoose models

module.exports = {
  User: require('./User'),
  FarmerProfile: require('./FarmerProfile'),
  Product: require('./Product'),
  Inventory: require('./Inventory'),
  Order: require('./Order'),
  Shipment: require('./Shipment'),
  Payment: require('./Payment'),
};

