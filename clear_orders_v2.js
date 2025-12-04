import mongoose from 'mongoose';
import { Order } from './backend/src/models/Order.js';
import { env } from './backend/src/config/env.js';
import { connectMongo } from './backend/src/config/mongo.js';

async function clearOrders() {
    // Auto-switch to localhost:27018 if running locally (outside Docker)
    if (env.mongoUri === 'mongodb://mongo:27017/greenharvest') {
        console.log('⚠️  Running locally? Switching to "localhost:27018" (Docker mapped port)...');
        env.mongoUri = 'mongodb://localhost:27018/greenharvest';
    }

    console.log('Connecting to Mongo at', env.mongoUri);
    await connectMongo();

    console.log('Clearing all orders...');
    const result = await Order.deleteMany({});
    console.log(`Deleted ${result.deletedCount} orders.`);

    await mongoose.disconnect();
    console.log('Done.');
}

clearOrders().catch((err) => {
    console.error(err);
    process.exit(1);
});
