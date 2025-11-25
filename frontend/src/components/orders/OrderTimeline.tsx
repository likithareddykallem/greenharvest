import type { PlatformOrder } from '../../lib/types';

type Props = {
  order: PlatformOrder;
};

export default function OrderTimeline({ order }: Props) {
  return (
    <div className="space-y-6 rounded-3xl border border-stone-200 bg-white/90 p-8 shadow-lg">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Order #{order.id}</p>
        <h2 className="text-2xl font-semibold text-stone-900">Status: {order.status}</h2>
        <p className="text-sm text-stone-500">
          ETA {order.eta} · {order.customer}
        </p>
      </header>
      <ol className="relative border-s border-dashed border-emerald-200 pl-6">
        {order.checkpoints.map((checkpoint) => (
          <li key={checkpoint.label} className="mb-8 last:mb-0">
            <div className="absolute -left-[9px] mt-1 size-4 rounded-full border border-white bg-brand-primary shadow" />
            <p className="text-sm font-semibold text-stone-900">{checkpoint.label}</p>
            <p className="text-sm text-stone-600">{checkpoint.detail}</p>
            <p className="text-xs text-stone-400">{checkpoint.timestamp}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}


