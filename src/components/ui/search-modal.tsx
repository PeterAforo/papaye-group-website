"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "./button";
import menuData from "@/data/menu.json";

interface SearchResult {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlineOrdersEnabled, setOnlineOrdersEnabled] = useState(true);
  const { addItem } = useCartStore();

  // Check online orders status
  useEffect(() => {
    async function checkOnlineOrders() {
      try {
        const res = await fetch("/api/settings/online-orders");
        if (res.ok) {
          const data = await res.json();
          setOnlineOrdersEnabled(data.enabled);
        }
      } catch (error) {
        console.error("Failed to check online orders:", error);
      }
    }
    checkOnlineOrders();
  }, []);

  // Search function
  const searchItems = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const lowerQuery = searchQuery.toLowerCase();
    
    const filtered = menuData.items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
    );

    setResults(filtered);
    setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchItems(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchItems]);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddToCart = (item: SearchResult) => {
    addItem({
      menuItemId: item.id,
      name: item.title,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-transparent hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search menu...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white rounded border">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for dishes, categories..."
                  className="flex-1 text-lg outline-none"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    {results.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.title}</h4>
                          <p className="text-sm text-gray-500 truncate">
                            {item.description}
                          </p>
                          <p className="text-primary font-bold">
                            GH₵ {item.price.toFixed(2)}
                          </p>
                        </div>
                        {onlineOrdersEnabled && (
                          <Button
                            size="sm"
                            onClick={() => {
                              handleAddToCart(item);
                              setIsOpen(false);
                            }}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : query ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No results found for &quot;{query}&quot;</p>
                    <Link
                      href="/menu"
                      className="text-primary hover:underline mt-2 inline-block"
                      onClick={() => setIsOpen(false)}
                    >
                      Browse full menu
                    </Link>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-3">Popular searches</p>
                    <div className="flex flex-wrap gap-2">
                      {["Chicken", "Jollof Rice", "Burger", "Fries", "Juice"].map(
                        (term) => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                          >
                            {term}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t bg-gray-50 text-xs text-gray-500">
                <span>Press ESC to close</span>
                <Link
                  href="/menu"
                  className="text-primary hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  View full menu →
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
