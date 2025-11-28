import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { DeliveryPartner } from '../src/models/DeliveryPartner.js';
import { getEnqueuedTasks } from '../src/services/taskService.js';

const createUserAndLogin = async (userPayload) => {
  await request(app).post('/api/auth/register').send(userPayload);
  const loginResp = await request(app).post('/api/auth/login').send({
    email: userPayload.email,
    password: userPayload.password,
  });
  return loginResp.body.accessToken;
};

describe('Orders and checkout', () => {
  let farmer;

  beforeEach(async () => {
    await User.create({
      name: 'Admin',
      email: 'admin@gh.test',
      password: 'Password123!',
      role: 'admin',
      approved: true,
    });

    farmer = await User.create({
      name: 'Farmer',
      email: 'farmer@gh.test',
      password: 'Password123!',
      role: 'farmer',
      approved: true,
    });

    await Product.create({
      name: 'Carrots',
      description: 'Organic carrots',
      price: 5,
      stock: 10,
      farmer: farmer.id,
      approvals: { approvedByAdmin: true },
      status: 'published',
    });
  });

  test('catalog, product detail and order tracking flow', async () => {
    const token = await createUserAndLogin({
      name: 'Customer',
      email: 'cust@test.com',
      password: 'Password123!',
      role: 'customer',
    });

    const catalog = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`);
    expect(catalog.statusCode).toBe(200);
    expect(catalog.body.items.length).toBe(1);
    const productId = catalog.body.items[0]._id;

    const detail = await request(app).get(`/api/products/${productId}`);
    expect(detail.body.name).toBe('Carrots');

    const checkout = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId, quantity: 2 }] });
    expect(checkout.statusCode).toBe(201);

    const payment = await request(app)
      .post('/api/payments/simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({ checkoutId: checkout.body.checkoutId });
    expect(payment.statusCode).toBe(200);
    const orderId = payment.body.orderId;

    const tracking = await request(app)
      .get(`/api/orders/${orderId}/track`)
      .set('Authorization', `Bearer ${token}`);
    expect(tracking.statusCode).toBe(200);
    expect(tracking.body.timeline[0].state).toBe('Pending');
  });

  test('inventory lock allows only limited parallel checkouts', async () => {
    const product = await Product.findOne();
    product.stock = 3;
    await product.save();

    const token = await createUserAndLogin({
      name: 'Burst Customer',
      email: 'burst@test.com',
      password: 'Password123!',
      role: 'customer',
    });

    const sessions = await Promise.all(
      Array.from({ length: 10 }).map(() =>
        request(app)
          .post('/api/cart/checkout')
          .set('Authorization', `Bearer ${token}`)
          .send({ items: [{ productId: product.id, quantity: 1 }] })
      )
    );

    const checkoutIds = sessions
      .filter((res) => res.statusCode === 201)
      .map((res) => res.body.checkoutId);

    const results = await Promise.all(
      checkoutIds.map((checkoutId) =>
        request(app)
          .post('/api/payments/simulate')
          .set('Authorization', `Bearer ${token}`)
          .send({ checkoutId })
      )
    );

    const successCount = results.filter((r) => r.statusCode === 200).length;
    const failureCount = results.filter((r) => r.statusCode === 409).length;
    expect(successCount).toBe(3);
    expect(failureCount).toBeGreaterThan(0);
  });

  test('delivery assignment enqueues notification task', async () => {
    await DeliveryPartner.create({
      name: 'Partner',
      contact: 'partner@example.com',
      zone: 'north',
      active: true,
    });

    const product = await Product.findOne();
    const customerToken = await createUserAndLogin({
      name: 'Delivery Customer',
      email: 'deliver@test.com',
      password: 'Password123!',
      role: 'customer',
    });

    const checkout = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: product.id, quantity: 1 }] });

    const payment = await request(app)
      .post('/api/payments/simulate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ checkoutId: checkout.body.checkoutId });

    const farmerToken = await request(app).post('/api/auth/login').send({
      email: 'farmer@gh.test',
      password: 'Password123!',
    });

    await request(app)
      .post(`/api/orders/${payment.body.orderId}/status`)
      .set('Authorization', `Bearer ${farmerToken.body.accessToken}`)
      .send({ state: 'Accepted', note: 'Auto-accept for test' });

    const packed = await request(app)
      .post(`/api/orders/${payment.body.orderId}/packed`)
      .set('Authorization', `Bearer ${farmerToken.body.accessToken}`);

    expect(packed.statusCode).toBe(200);
    expect(packed.body.delivery.name).toBe('Partner');
    const queued = getEnqueuedTasks().find((task) => task.taskName === 'notify_delivery_assignment');
    expect(queued).toBeDefined();
  });

  test('low stock triggers notification task', async () => {
    const product = await Product.findOne();
    product.stock = 2;
    await product.save();

    const token = await createUserAndLogin({
      name: 'LowStock Customer',
      email: 'low@test.com',
      password: 'Password123!',
      role: 'customer',
    });

    const checkout = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product.id, quantity: 1 }] });

    await request(app)
      .post('/api/payments/simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({ checkoutId: checkout.body.checkoutId });

    const queued = getEnqueuedTasks().filter((task) => task.taskName === 'notify_low_stock');
    expect(queued.length).toBeGreaterThan(0);
  });

  test('farmer status transitions follow allowed lifecycle', async () => {
    const product = await Product.findOne();
    const customerToken = await createUserAndLogin({
      name: 'Lifecycle Customer',
      email: 'lifecycle@test.com',
      password: 'Password123!',
      role: 'customer',
    });

    const checkout = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: product.id, quantity: 1 }] });

    const payment = await request(app)
      .post('/api/payments/simulate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ checkoutId: checkout.body.checkoutId });

    const orderId = payment.body.orderId;

    const farmerLogin = await request(app).post('/api/auth/login').send({
      email: 'farmer@gh.test',
      password: 'Password123!',
    });
    const farmerToken = farmerLogin.body.accessToken;

    const invalid = await request(app)
      .post(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ state: 'Packed', note: 'Skipping acceptance' });
    expect(invalid.statusCode).toBe(400);

    const accepted = await request(app)
      .post(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ state: 'Accepted', note: 'Ready to harvest' });
    expect(accepted.statusCode).toBe(200);

    const packed = await request(app)
      .post(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ state: 'Packed', note: 'Crates sealed' });
    expect(packed.statusCode).toBe(200);

    const shipped = await request(app)
      .post(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ state: 'Shipped', note: 'Courier picked up' });
    expect(shipped.statusCode).toBe(200);

    const delivered = await request(app)
      .post(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ state: 'Delivered', note: 'Handed to customer' });
    expect(delivered.statusCode).toBe(200);

    const tracking = await request(app)
      .get(`/api/orders/${orderId}/track`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(tracking.body.status).toBe('Delivered');
    expect(tracking.body.timeline.at(-1).state).toBe('Delivered');
  });
});

