import mongoose from 'mongoose';
import { Product } from './src/models/Product.js';

async function verify() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/greenharvest');
        const products = await Product.find({});
        console.log('Products found:', products.length);
        products.forEach(p => {
            console.log(`${p.name}: ${p.imageUrl}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
