import mongoose from 'mongoose';
import { Product } from '../backend/src/models/Product.js';
import { User } from '../backend/src/models/User.js';
import { env } from '../backend/src/config/env.js';
import { connectMongo } from '../backend/src/config/mongo.js';

async function checkDb() {
    if (env.mongoUri.includes('mongo:27017')) {
        env.mongoUri = env.mongoUri.replace('mongo:27017', 'localhost:27017');
    }
    console.log('Connecting to', env.mongoUri);
    await connectMongo();

    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();

    console.log(`Products: ${productCount}`);
    console.log(`Users: ${userCount}`);

    if (productCount > 0) {
        const p = await Product.findOne();
        console.log('Sample Product:', p.name, p.status);
    }

    await mongoose.disconnect();
}

checkDb().catch(console.error);
