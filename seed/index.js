import mongoose from 'mongoose';
import { User } from '../backend/src/models/User.js';
import { Product } from '../backend/src/models/Product.js';
import { Order } from '../backend/src/models/Order.js';
import { env } from '../backend/src/config/env.js';
import { connectMongo } from '../backend/src/config/mongo.js';
import { Taxonomy } from '../backend/src/models/Taxonomy.js';

const productsSeed = [
  { name: 'Kashmir Apples', description: 'Crisp and sweet apples from the valleys of Kashmir.', price: 180, stock: 50, categories: ['Fruits'], certificationTags: ['NPOP', 'Jaivik Bharat'], imageUrl: '/images/apples.webp' },
  { name: 'Palak (Spinach)', description: 'Fresh organic spinach leaves, perfect for salads and curries.', price: 40, stock: 100, categories: ['Leafy Greens'], certificationTags: ['PGS-India'], imageUrl: '/images/Spinach.webp' },
  { name: 'Desi Potatoes', description: 'Locally grown potatoes, great for roasting.', price: 35, stock: 200, categories: ['Roots & Tubers'], certificationTags: ['Jaivik Bharat', 'AGMARK'], imageUrl: '/images/potato.jpg' },
  { name: 'Alphonso Mangoes', description: 'Premium Ratnagiri Alphonso mangoes.', price: 800, stock: 20, categories: ['Fruits', 'Exotic'], certificationTags: ['NPOP', 'FPO'], imageUrl: '/images/mango.jpg' },
  { name: 'Broccoli', description: 'Fresh green broccoli heads.', price: 120, stock: 30, categories: ['Exotic'], certificationTags: ['PGS-India'], imageUrl: '/images/broccoli.webp' },
  { name: 'Carrots', description: 'Sweet and crunchy organic carrots.', price: 60, stock: 80, categories: ['Roots & Tubers'], certificationTags: ['Jaivik Bharat'], imageUrl: '/images/carrot.webp' },
  { name: 'Marigold Flowers', description: 'Fresh orange marigolds for decoration.', price: 200, stock: 50, categories: ['Flowers'], certificationTags: [], imageUrl: '/images/marigold.jpeg' },
  { name: 'Zucchini', description: 'Fresh green zucchini, perfect for grilling.', price: 150, stock: 40, categories: ['Exotic'], certificationTags: ['NPOP'], imageUrl: '/images/zucchini.jpeg' },
  { name: 'Blueberries', description: 'Sweet and tangy fresh blueberries.', price: 400, stock: 25, categories: ['Fruits', 'Exotic'], certificationTags: ['Jaivik Bharat'], imageUrl: '/images/blueberry.webp' },
];

async function seed() {
  // Auto-switch to localhost:27018 if running locally (outside Docker)
  // We detect this by checking if we can resolve 'mongo' or if the default URI fails.
  // For simplicity, if the URI is the default docker one, we switch to localhost:27018.
  if (env.mongoUri === 'mongodb://mongo:27017/greenharvest') {
    console.log('⚠️  Running locally? Switching to "localhost:27018" (Docker mapped port)...');
    env.mongoUri = 'mongodb://localhost:27018/greenharvest';
  }

  console.log('Connecting to Mongo at', env.mongoUri);
  await connectMongo();

  // await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
  // await Taxonomy.deleteMany();

  const createUserIfMissing = async (userData) => {
    const existing = await User.findOne({ email: userData.email });
    if (existing) return existing;
    return User.create(userData);
  };

  const admin = await createUserIfMissing({
    name: 'Admin',
    email: 'admin@greenharvest.io',
    password: 'AdminPass123!',
    role: 'admin',
    approved: true,
  });

  const farmers = await Promise.all([
    createUserIfMissing({
      name: 'Ramesh Kumar',
      email: 'farmer1@gh.io',
      password: 'Farmer123!',
      role: 'farmer',
      approved: true,
    }),
    createUserIfMissing({
      name: 'Suresh Patel',
      email: 'farmer2@gh.io',
      password: 'Farmer123!',
      role: 'farmer',
      approved: true,
    }),
  ]);

  const customers = await Promise.all([
    createUserIfMissing({
      name: 'Priya Sharma',
      email: 'priyasharma@gh.io',
      password: 'Customer123!',
      role: 'customer',
      approved: true,
    }),
    createUserIfMissing({
      name: 'Rahul Verma',
      email: 'rahulverma@gh.io',
      password: 'Customer123!',
      role: 'customer',
      approved: true,
    }),
  ]);

  // Only seed products if DB is empty of products to avoid duplicates or messing up user data
  const productCount = await Product.countDocuments();
  let products = [];
  if (productCount === 0) {
    products = await Product.insertMany(
      productsSeed.map((product, index) => ({
        ...product,
        farmer: farmers[index % farmers.length]._id,
        approvals: { approvedByAdmin: true, status: 'approved' },
        status: 'published',
      }))
    );
  } else {
    products = await Product.find();
  }

  const taxonomyCount = await Taxonomy.countDocuments();
  if (taxonomyCount === 0) {
    await Taxonomy.insertMany([
      { type: 'category', label: 'Leafy Greens', description: 'Spinach, Methi, Coriander' },
      { type: 'category', label: 'Roots & Tubers', description: 'Potatoes, Carrots, Radish' },
      { type: 'category', label: 'Fruits', description: 'Seasonal Indian fruits' },
      { type: 'category', label: 'Exotic', description: 'Broccoli, Zucchini, Avocados' },
      { type: 'category', label: 'Flowers', description: 'Marigold, Roses, Jasmine' },
      { type: 'certification', label: 'Jaivik Bharat', description: 'India Organic Certification' },
      { type: 'certification', label: 'NPOP', description: 'National Programme for Organic Production' },
      { type: 'certification', label: 'PGS-India', description: 'Participatory Guarantee System' },
      { type: 'certification', label: 'AGMARK', description: 'Agricultural Mark' },
      { type: 'certification', label: 'FPO', description: 'Fruit Products Order' },
    ]);
  }

  // Only seed orders if we just seeded products (fresh DB)
  if (productCount === 0) {
    const statuses = ['Accepted', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
    const orders = [];

    for (let i = 0; i < 20; i++) {
      const status = statuses[i % statuses.length];
      orders.push({
        customer: customers[i % customers.length]._id,
        items: [
          { product: products[0]._id, name: products[0].name, quantity: 1, price: products[0].price },
        ],
        total: products[0].price,
        paymentReference: `ORD-${1000 + i}`,
        status: status,
        createdAt: new Date(new Date().setDate(new Date().getDate() - i)), // Spread over last 20 days
        timeline: [{ state: 'Pending', note: 'Order placed', timestamp: new Date() }]
      });
    }
    await Order.insertMany(orders);
  }

  console.log('Seed completed. Existing data was preserved.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

