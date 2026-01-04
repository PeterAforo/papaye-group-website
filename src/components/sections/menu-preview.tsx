"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ArrowRight, Star, Loader2, Plus, Check } from "lucide-react";
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

export function MenuPreview() {
  const ref = useRef(null);
  const router = useRouter();
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [onlineOrdersEnabled, setOnlineOrdersEnabled] = useState(true);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          const popular = data.items.filter((item: MenuItem) => item.popular).slice(0, 4);
          setPopularItems(popular);
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

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation(); // Prevent card click
    addItem({
      menuItemId: item.id,
      name: item.title,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    
    // Show added feedback
    setAddedItems(prev => new Set(prev).add(item.id));
    openCart(); // Open cart sidebar
    setTimeout(() => {
      setAddedItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  const handleCardClick = (item: MenuItem) => {
    router.push(`/menu?item=${item.id}`);
  };

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Our Popular Menu"
          subtitle="Discover our most loved dishes, crafted with passion and served with love"
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {popularItems.map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
              <Card 
                className="group cursor-pointer overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => handleCardClick(item)}
              >
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  
                  {/* Popular badge */}
                  <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                    Popular
                  </div>

                  {/* Quick add button */}
                  {onlineOrdersEnabled && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        className={`rounded-full w-10 h-10 p-0 ${addedItems.has(item.id) ? 'bg-green-500 hover:bg-green-600' : ''}`}
                        onClick={(e) => handleAddToCart(e, item)}
                      >
                        {addedItems.has(item.id) ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </Button>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
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
        </motion.div>
        )}

        <div className="text-center">
          <Link href="/menu">
            <Button size="lg" className="group">
              View Full Menu
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
