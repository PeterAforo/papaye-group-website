import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getItem: (menuItemId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.menuItemId === item.menuItemId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: crypto.randomUUID(),
                menuItemId: item.menuItemId,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity || 1,
                notes: item.notes,
              },
            ],
          });
        }
      },

      removeItem: (menuItemId) => {
        set({
          items: get().items.filter((i) => i.menuItemId !== menuItemId),
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      updateNotes: (menuItemId, notes) => {
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, notes } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItem: (menuItemId) => {
        return get().items.find((i) => i.menuItemId === menuItemId);
      },
    }),
    {
      name: "papaye-cart",
    }
  )
);
