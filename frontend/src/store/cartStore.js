import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (product, quantity = 1) => {
    const existing = get().items.find((item) => item.productId === product._id);
    if (existing) {
      set({
        items: get().items.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + quantity } : item
        ),
      });
    } else {
      set({
        items: [
          ...get().items,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.imageUrl || product.gallery?.[0] || '/images/placeholder-veg.jpg',
          },
        ],
      });
    }
  },
  removeItem: (productId) => set({ items: get().items.filter((item) => item.productId !== productId) }),
  updateQuantity: (productId, quantity) =>
    set({
      items: get().items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }),
  clear: () => set({ items: [] }),
}));

