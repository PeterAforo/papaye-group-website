"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
  const [mounted, setMounted] = useState(false);
  const { openCart, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  // Prevent hydration mismatch by only rendering count after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={openCart}
      className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
      aria-label="Open cart"
    >
      <ShoppingCart className="w-6 h-6" />
      {mounted && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-secondary text-dark text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
