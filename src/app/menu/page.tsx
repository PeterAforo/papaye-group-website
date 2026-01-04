"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/modal";
import { staggerContainer, staggerItem, scaleIn } from "@/lib/animations";
import { Star, Plus, ShoppingCart, X, Check, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

interface MenuItem {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  description: string;
  popular?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [menuData, setMenuData] = useState<MenuData>({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [onlineOrdersEnabled, setOnlineOrdersEnabled] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          setMenuData(data);
        }
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoading(false);
      }
    }
    
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
    
    fetchMenu();
    checkOnlineOrders();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.title,
      price: item.price,
      image: item.image,
    });
    setAddedItems((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  const filteredItems =
    activeCategory === "all"
      ? menuData.items
      : menuData.items.filter((item) => item.category === activeCategory);

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary via-primary-600 to-primary-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-secondary text-dark px-4 py-2 rounded-full text-sm font-bold mb-4">
              🍽️ Explore Our Menu
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-4">
              Delicious Food Menu
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              From traditional Ghanaian favorites to modern fast food classics,
              discover dishes crafted with passion and served with love.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section ref={ref} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
              className="rounded-full"
            >
              All Items
            </Button>
            {menuData.categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="rounded-full"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </motion.div>

          {/* Menu Grid */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  variants={staggerItem}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="group cursor-pointer overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {item.popular && (
                        <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                          Popular
                        </div>
                      )}

                      {onlineOrdersEnabled && (
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            className={`rounded-full w-10 h-10 p-0 ${
                              addedItems.has(item.id) ? "bg-green-500 hover:bg-green-600" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                          >
                            {addedItems.has(item.id) ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(4.9)</span>
                      </div>

                      <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold text-xl">
                          GH₵ {item.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
                          {item.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No items found in this category.
              </p>
            </div>
          )}
            </>
          )}
        </div>
      </section>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <div className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                {selectedItem.popular && (
                  <div className="absolute top-4 left-4 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                    ⭐ Popular Choice
                  </div>
                )}
              </div>

              <DialogHeader>
                <DialogTitle className="text-2xl font-heading">
                  {selectedItem.title}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {selectedItem.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-gray-500">(4.9 rating)</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
                    {selectedItem.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-gray-500 text-sm">Price</span>
                    <div className="text-primary font-bold text-3xl">
                      GH₵ {selectedItem.price.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className={`gap-2 ${
                      addedItems.has(selectedItem.id) ? "bg-green-500 hover:bg-green-600" : ""
                    }`}
                    onClick={() => {
                      handleAddToCart(selectedItem);
                    }}
                    disabled={!onlineOrdersEnabled}
                  >
                    {!onlineOrdersEnabled ? (
                      "Ordering Unavailable"
                    ) : addedItems.has(selectedItem.id) ? (
                      <>
                        <Check className="w-5 h-5" />
                        Added!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
