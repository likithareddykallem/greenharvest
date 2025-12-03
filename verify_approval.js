import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4000/api';
const FARMER_EMAIL = 'farmer1@gh.io';
const FARMER_PASSWORD = 'Farmer123!';
const ADMIN_EMAIL = 'admin@greenharvest.io';
const ADMIN_PASSWORD = 'AdminPass123!';

async function verifyApprovalFlow() {
    try {
        // 1. Login as Farmer
        console.log('1. Logging in as Farmer...');
        const farmerLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: FARMER_EMAIL,
            password: FARMER_PASSWORD,
        });
        const farmerToken = farmerLogin.data.accessToken;

        // 2. Publish Product
        console.log('2. Publishing Product...');
        const form = new FormData();
        form.append('name', 'Approval Test Product');
        form.append('price', '200');
        form.append('stock', '50');
        form.append('categories', 'Fruits');

        const dummyPath = path.join(process.cwd(), 'approval_test.jpg');
        fs.writeFileSync(dummyPath, 'dummy content');
        form.append('image', fs.createReadStream(dummyPath));

        const publishRes = await axios.post(`${BASE_URL}/products/farmer`, form, {
            headers: { Authorization: `Bearer ${farmerToken}`, ...form.getHeaders() }
        });
        const productId = publishRes.data._id;
        console.log(`   Product Published: ${productId}`);

        // 3. Login as Admin
        console.log('3. Logging in as Admin...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        });
        const adminToken = adminLogin.data.accessToken;

        // 4. Check Pending Products
        console.log('4. Checking Pending Products...');
        const pendingRes = await axios.get(`${BASE_URL}/admin/products/pending`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const pendingProduct = pendingRes.data.find(p => p._id === productId);

        if (!pendingProduct) {
            throw new Error('Product not found in pending list!');
        }
        console.log('   Product found in pending list.');

        // 5. Approve Product
        console.log('5. Approving Product...');
        await axios.post(`${BASE_URL}/admin/products/${productId}/approve`, { status: 'approved' }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Product Approved.');

        // 6. Verify Public Visibility
        console.log('6. Verifying Public Visibility...');
        const publicRes = await axios.get(`${BASE_URL}/products`);
        const publicProduct = publicRes.data.items.find(p => p._id === productId);

        if (!publicProduct) {
            throw new Error('Product not found in public catalog after approval!');
        }
        console.log('   Product visible in catalog.');

        // Cleanup
        fs.unlinkSync(dummyPath);
        console.log('Verification Successful!');

    } catch (err) {
        console.error('Verification Failed:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.stack);
        }
        process.exit(1);
    }
}

verifyApprovalFlow();
