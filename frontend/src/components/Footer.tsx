import Link from 'next/link';

const footerLinks = [
  {
    title: 'Customers',
    items: [
      { label: 'Browse catalog', href: '/catalog' },
      { label: 'Order tracking', href: '/orders' },
      { label: 'Payment options', href: '/cart' }
    ]
  },
  {
    title: 'Farmers',
    items: [
      { label: 'Portal', href: '/farmer/portal' },
      { label: 'Certification help', href: '/docs/certifications' },
      { label: 'Analytics via Grafana', href: '/monitoring' }
    ]
  },
  {
    title: 'Admin',
    items: [
      { label: 'Platform dashboard', href: '/dashboard' },
      { label: 'User management', href: '/dashboard#users' },
      { label: 'Content moderation', href: '/dashboard#moderation' }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-white/80">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-brand-primary">GreenHarvest</p>
            <p className="mt-2 text-sm text-stone-500">
              Certified marketplace infrastructure for conscious supply chains.
            </p>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">{section.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition hover:text-brand-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-stone-500">© {new Date().getFullYear()} GreenHarvest Cooperative</p>
      </div>
    </footer>
  );
}








