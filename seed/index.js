import mongoose from 'mongoose';
import { User } from '../backend/src/models/User.js';
import { Product } from '../backend/src/models/Product.js';
import { DeliveryPartner } from '../backend/src/models/DeliveryPartner.js';
import { Order } from '../backend/src/models/Order.js';
import { env } from '../backend/src/config/env.js';
import { connectMongo } from '../backend/src/config/mongo.js';
import { Taxonomy } from '../backend/src/models/Taxonomy.js';

const productsSeed = [
  { name: 'Tomatoes', description: 'Heirloom tomatoes', price: 4, stock: 25 },
  { name: 'Spinach', description: 'Fresh spinach', price: 3, stock: 30 },
  { name: 'Apples', description: 'Honeycrisp apples', price: 5, stock: 20 },
  { name: 'Potatoes', description: 'Golden potatoes', price: 2, stock: 50 },
  { name: 'Blueberries', description: 'Wild blueberries', price: 6, stock: 15 },
  { name: 'Zucchini', description: 'Green zucchini', price: 3, stock: 18 },
];

const partnersSeed = [
  { name: 'QuickCart', contact: 'quick@example.com', zone: 'north' },
  { name: 'AgroDeliver', contact: 'agro@example.com', zone: 'central' },
  { name: 'FarmRide', contact: 'ride@example.com', zone: 'south' },
];

async function seed() {
  console.log('Connecting to Mongo at', env.mongoUri);
  await connectMongo();

  await Promise.all([User.deleteMany(), Product.deleteMany(), DeliveryPartner.deleteMany(), Order.deleteMany()]);
  await Taxonomy.deleteMany();

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@greenharvest.io',
    password: 'AdminPass123!',
    role: 'admin',
    approved: true,
  });

  // Use User.create so Mongoose password hashing runs (insertMany bypasses pre-save hooks)
  const farmers = await Promise.all([
    User.create({
      name: 'Farmer One',
      email: 'farmer1@gh.io',
      password: 'Farmer123!',
      role: 'farmer',
      approved: true,
    }),
    User.create({
      name: 'Farmer Two',
      email: 'farmer2@gh.io',
      password: 'Farmer123!',
      role: 'farmer',
      approved: true,
    }),
  ]);

  const customers = await Promise.all([
    User.create({
      name: 'Alice Customer',
      email: 'alice@gh.io',
      password: 'Customer123!',
      role: 'customer',
      approved: true,
    }),
    User.create({
      name: 'Bob Customer',
      email: 'bob@gh.io',
      password: 'Customer123!',
      role: 'customer',
      approved: true,
    }),
  ]);

  const products = await Product.insertMany(
    productsSeed.map((product, index) => ({
      ...product,
      farmer: farmers[index % farmers.length]._id,
      approvals: { approvedByAdmin: true },
      status: 'published',
    }))
  );

  await DeliveryPartner.insertMany(partnersSeed);

  await Taxonomy.insertMany([
    { type: 'category', label: 'Leafy greens', description: 'Spinach, lettuce, bok choy' },
    { type: 'category', label: 'Roots', description: 'Carrots, beets, potatoes' },
    { type: 'certification', label: 'Organic EU', description: 'Meets EU organic guidelines' },
    { type: 'certification', label: 'GlobalG.A.P.', description: 'Global food safety certification' },
  ]);

  await Order.create({
    customer: customers[0]._id,
    items: [
      { product: products[0]._id, name: products[0].name, quantity: 2, price: products[0].price },
      { product: products[1]._id, name: products[1].name, quantity: 1, price: products[1].price },
    ],
    total: 2 * products[0].price + products[1].price,
    paymentReference: 'SEED-ORDER',
    status: 'Shipped',
    timeline: [
      { state: 'Pending', note: 'Order placed', timestamp: new Date() },
      { state: 'Accepted', note: 'Confirmed by farmer', timestamp: new Date() },
      { state: 'Packed', note: 'Packed and ready', timestamp: new Date() },
      { state: 'Shipped', note: 'Driver picked up', timestamp: new Date() },
    ],
  });

  console.log('Seed completed. Admin login: admin@greenharvest.io / AdminPass123!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

