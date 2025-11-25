import type { FarmerOrder, PaymentGateway, PlatformOrder, Review, ShowcaseFarmer } from './types';

export const certifications = ['USDA Organic', 'Non-GMO Project', 'Fair-Trade', 'GlobalG.A.P.', 'Rainforest Alliance'];

export const paymentGateways: PaymentGateway[] = [
  { id: 'stripe', label: 'Stripe', status: 'Operational', features: ['Digital wallets', '3D Secure'] },
  { id: 'adyen', label: 'Adyen', status: 'Operational', features: ['SEPA', 'Interchange++ reporting'] },
  { id: 'mpesa', label: 'M-PESA', status: 'Pilot', features: ['Instant settlement', 'SMS confirmations'] }
];

export const farmers: ShowcaseFarmer[] = [
  {
    id: 'sunrise',
    name: 'Sunrise Farms Cooperative',
    location: 'Healdsburg, CA',
    heroImage: '/images/farms/sunrise-fields.jpg',
    avatar: '/images/farms/sunrise-avatar.jpg',
    certifications: ['USDA Organic', 'GlobalG.A.P.'],
    story: 'Regenerative viticulture collective focused on carbon-negative produce with full blockchain traceability.',
    specialties: ['Heirloom tomatoes', 'Biodynamic greens', 'Artisanal olive oil'],
    fulfillmentStats: {
      onTimeRate: 98,
      sustainabilityScore: 92,
      avgLeadTimeDays: 2
    },
    logisticsPartners: ['Lineage Logistics', 'Maersk Flow'],
    contact: {
      email: 'hello@sunrisefarms.co',
      phone: '+1 (415) 555-0164',
      site: 'https://sunrisefarms.co'
    },
    social: {
      instagram: 'sunrisefarms'
    }
  },
  {
    id: 'mossy',
    name: 'Mossy Creek Collective',
    location: 'Asheville, NC',
    heroImage: '/images/farms/mossy-greenhouse.jpg',
    avatar: '/images/farms/mossy-avatar.jpg',
    certifications: ['USDA Organic', 'Rainforest Alliance', 'Fair-Trade'],
    story: 'Worker-owned coop specializing in leafy greens, microgreens, and heritage teas using closed-loop aquaponics.',
    specialties: ['Microgreens', 'Firefly tea blend', 'Medicinal herbs'],
    fulfillmentStats: {
      onTimeRate: 95,
      sustainabilityScore: 89,
      avgLeadTimeDays: 3
    },
    logisticsPartners: ['UPS Cold Chain', 'Flexe'],
    contact: {
      email: 'orders@mossycreek.org',
      phone: '+1 (828) 555-0108'
    },
    social: {
      instagram: 'mossycreek',
      linkedin: 'company/mossycreek'
    }
  }
];

export const reviews: Review[] = [
  {
    id: 'rvw-01',
    productId: 'prd-01',
    customer: 'Chef Laila Anwar',
    title: 'Unmatched sweetness + traceability',
    body: 'The lot-level telemetry PDF gave my procurement team exactly what we needed. Flavor profile is consistent week over week.',
    rating: 5,
    badges: ['Verified kitchen', 'Volume buyer'],
    createdAt: '2 days ago'
  },
  {
    id: 'rvw-02',
    productId: 'prd-02',
    customer: 'Harvest Box CSA',
    title: 'Shelf life exceeded SLA',
    body: 'Arrived crisp with zero wilt. Appreciated the live inventory feed so we could plan our drop-offs.',
    rating: 4,
    badges: ['Subscription partner'],
    createdAt: '1 week ago'
  }
];

export const farmerOrders: FarmerOrder[] = [
  {
    id: 'order-7821',
    buyer: 'Harvest Box CSA',
    status: 'Processing',
    value: 4150,
    destination: 'Nashville, TN',
    expectedShip: 'Nov 26',
    items: [
      { name: 'Organic Kale Bundle', quantity: 400, unit: 'bunches' },
      { name: 'Firefly tea blend', quantity: 120, unit: 'tins' }
    ]
  },
  {
    id: 'order-7818',
    buyer: 'Chef Collective NYC',
    status: 'Ready for pickup',
    value: 2875,
    destination: 'Brooklyn, NY',
    expectedShip: 'Today',
    items: [{ name: 'Heirloom Tomatoes', quantity: 180, unit: 'kg' }]
  }
];

export const platformOrder: PlatformOrder = {
  id: 'GH-22194',
  status: 'In transit',
  customer: 'Marigold Pantry',
  total: 1280,
  eta: 'Nov 28',
  checkpoints: [
    { label: 'Order submitted', detail: 'Payment verified via Stripe', timestamp: 'Nov 22, 08:10', completed: true },
    { label: 'Farmer confirmed', detail: 'Sunrise Farms accepted SLA', timestamp: 'Nov 22, 10:02', completed: true },
    { label: 'Packed & scanned', detail: 'Cold-chain seal 98% integrity', timestamp: 'Nov 23, 06:47', completed: true },
    { label: 'In transit', detail: 'Lineage Logistics trailer #LL-223', timestamp: 'Nov 24, 14:03', completed: true },
    { label: 'Final delivery', detail: 'Awaiting customer dock availability', timestamp: '—', completed: false }
  ]
};


