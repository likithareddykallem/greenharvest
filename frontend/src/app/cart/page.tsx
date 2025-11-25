import CartSummary from '../../components/cart/CartSummary';

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Secure cart</p>
        <h1 className="text-4xl font-semibold text-stone-900">Multi-gateway checkout</h1>
        <p className="text-sm text-stone-600">
          Tokenized cards, ACH, and cross-border options via Stripe, Adyen, and M-PESA with 3D Secure enforcement.
        </p>
      </header>
      <CartSummary />
    </div>
  );
}








