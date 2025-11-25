import Link from 'next/link';

const navLinks = [
  { href: '/catalog', label: 'Marketplace' },
  { href: '/farmers', label: 'Farmers' },
  { href: '/farmer/portal', label: 'Farmer portal' },
  { href: '/dashboard', label: 'Admin' }
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-emerald-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-brand-primary">
          GreenHarvest
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-brand-primary">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/register"
            className="rounded-full border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
          >
            Register
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-primary/20"
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  );
}

