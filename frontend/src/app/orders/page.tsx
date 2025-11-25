import OrderTimeline from '../../components/orders/OrderTimeline';
import { platformOrder } from '../../lib/data';

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Order tracking</p>
        <h1 className="text-4xl font-semibold text-stone-900">Cold-chain aware shipment visibility</h1>
        <p className="text-sm text-stone-600">
          Every order includes tamper-proof checkpoints from the farmer, cold-storage partner, and final delivery dock.
        </p>
      </header>
      <OrderTimeline order={platformOrder} />
    </div>
  );
}








