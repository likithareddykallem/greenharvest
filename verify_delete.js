import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4000/api';
const FARMER_EMAIL = 'farmer1@gh.io';
const FARMER_PASSWORD = 'Farmer123!';

async function verifyDelete() {
    try {
        // 1. Login as Farmer
        console.log('1. Logging in as Farmer...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: FARMER_EMAIL,
            password: FARMER_PASSWORD,
        });
        const token = loginRes.data.accessToken;

        // 2. Create Dummy Product
        console.log('2. Creating Dummy Product...');
        const form = new FormData();
        form.append('name', 'Delete Test Product');
        form.append('price', '100');
        form.append('stock', '10');
        form.append('categories', 'Fruits');

        const dummyPath = path.join(process.cwd(), 'delete_test.jpg');
        fs.writeFileSync(dummyPath, 'dummy content');
        form.append('image', fs.createReadStream(dummyPath));

        const createRes = await axios.post(`${BASE_URL}/products/farmer`, form, {
            headers: { Authorization: `Bearer ${token}`, ...form.getHeaders() }
        });
        const productId = createRes.data._id;
        console.log(`   Product Created: ${productId}`);

        // 3. Delete Product
        console.log('3. Deleting Product...');
        await axios.delete(`${BASE_URL}/farmer/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Product Deleted.');

        // 4. Verify Deletion
        console.log('4. Verifying Deletion...');
        const listRes = await axios.get(`${BASE_URL}/farmer/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const found = listRes.data.find(p => p._id === productId);

        if (found) {
            throw new Error('Product still exists in inventory!');
        }
        console.log('   Product not found in inventory (Success).');

        // Cleanup
        fs.unlinkSync(dummyPath);
        console.log('Verification Successful!');

    } catch (err) {
        console.error('Verification Failed:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
        }
        process.exit(1);
    }
}

verifyDelete();
