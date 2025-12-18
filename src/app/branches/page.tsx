"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { MapPin, Clock, Phone, Navigation, ExternalLink, Loader2 } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
  hours: string;
  mapUrl: string;
  coordinates: { lat: number; lng: number };
  directionsUrl: string;
  image?: string;
  featured?: boolean;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await fetch("/api/branches");
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches);
          if (data.branches.length > 0) {
            setSelectedBranch(data.branches[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBranches();
  }, []);

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
              📍 Find Us
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-4">
              Our Branches
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              With locations across Ghana, there&apos;s always a Papaye near you.
              Visit us today for an unforgettable dining experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Branches Section */}
      <section ref={ref} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Branch List */}
            <div className="lg:col-span-1">
              <h2 className="font-heading font-bold text-2xl mb-6">All Locations</h2>
              <motion.div
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={staggerContainer}
                className="space-y-4"
              >
                {branches.map((branch) => (
                  <motion.div key={branch.id} variants={staggerItem}>
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedBranch?.id === branch.id
                          ? "border-2 border-primary shadow-lg"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedBranch(branch)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              selectedBranch?.id === branch.id
                                ? "bg-primary text-white"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-bold text-lg truncate">
                              {branch.name}
                            </h3>
                            <p className="text-gray-600 text-sm truncate">
                              {branch.location}
                            </p>
                            {branch.featured && (
                              <span className="inline-block mt-2 text-xs bg-secondary text-dark px-2 py-0.5 rounded-full font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Selected Branch Details & Map */}
            <div className="lg:col-span-2">
              {selectedBranch && (
              <motion.div
                key={selectedBranch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Google Maps Embed */}
                <Card className="mb-6 overflow-hidden">
                  <div className="aspect-video relative">
                    <iframe
                      src={selectedBranch.mapUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      title={`Map of ${selectedBranch.name}`}
                    />
                  </div>
                </Card>

                {/* Branch Details */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="font-heading font-bold text-2xl mb-2">
                          {selectedBranch.name}
                        </h2>
                        {selectedBranch.featured && (
                          <span className="inline-block text-sm bg-secondary text-dark px-3 py-1 rounded-full font-medium">
                            ⭐ Featured Location
                          </span>
                        )}
                      </div>
                      <a
                        href={selectedBranch.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="gap-2">
                          <Navigation className="w-4 h-4" />
                          Get Directions
                        </Button>
                      </a>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Address</p>
                          <p className="font-medium">{selectedBranch.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Opening Hours</p>
                          <p className="font-medium">{selectedBranch.hours}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Phone</p>
                          <a
                            href={`tel:${selectedBranch.phone}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {selectedBranch.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                      <a href={`tel:${selectedBranch.phone}`}>
                        <Button variant="outline" className="gap-2">
                          <Phone className="w-4 h-4" />
                          Call Branch
                        </Button>
                      </a>
                      <a
                        href={selectedBranch.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          View on Google Maps
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              )}
            </div>
          </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
              Can&apos;t Visit? We&apos;ll Come to You!
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Order online and enjoy our delicious meals delivered right to your doorstep.
            </p>
            <Button variant="secondary" size="lg">
              Order Delivery Now
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
