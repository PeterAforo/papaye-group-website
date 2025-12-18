"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { MapPin, Clock, Phone, ArrowRight, X, Loader2, Navigation } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
  hours: string;
  mapUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  directionsUrl: string;
  image?: string;
  featured?: boolean;
  distance?: number; // Distance in km from user
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function BranchesSection() {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [nearestBranches, setNearestBranches] = useState<Branch[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<"detecting" | "found" | "denied" | "error">("detecting");
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Fetch branches and detect location
  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await fetch("/api/branches");
        if (res.ok) {
          const data = await res.json();
          const branches = data.branches || [];
          setAllBranches(branches);
          
          // Try to get user's location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                setUserLocation({ lat: userLat, lng: userLng });
                setLocationStatus("found");
                
                // Calculate distances and sort by nearest
                const branchesWithDistance = branches.map((branch: Branch) => ({
                  ...branch,
                  distance: branch.coordinates 
                    ? calculateDistance(userLat, userLng, branch.coordinates.lat, branch.coordinates.lng)
                    : 9999
                }));
                
                branchesWithDistance.sort((a: Branch, b: Branch) => (a.distance || 0) - (b.distance || 0));
                setNearestBranches(branchesWithDistance.slice(0, 3));
              },
              (error) => {
                console.log("Geolocation error:", error.message);
                setLocationStatus(error.code === 1 ? "denied" : "error");
                // Fall back to featured branches
                const featured = branches.filter((b: Branch) => b.featured).slice(0, 3);
                setNearestBranches(featured.length > 0 ? featured : branches.slice(0, 3));
              },
              { timeout: 10000, enableHighAccuracy: false }
            );
          } else {
            setLocationStatus("error");
            // Fall back to featured branches
            const featured = branches.filter((b: Branch) => b.featured).slice(0, 3);
            setNearestBranches(featured.length > 0 ? featured : branches.slice(0, 3));
          }
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
        setLocationStatus("error");
      } finally {
        setLoading(false);
      }
    }
    fetchBranches();
  }, []);

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeMap = () => {
    setSelectedBranch(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  return (
    <section ref={ref} className="py-20 bg-primary relative">
      {/* Map Modal */}
      <AnimatePresence>
        {selectedBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={closeMap}
          >
            <motion.div 
              className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeMap}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                aria-label="Close map"
              >
                <X className="w-5 h-5 text-gray-800" />
              </button>
              <div className="aspect-video w-full">
                <iframe
                  src={selectedBranch.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold mb-2">{selectedBranch.name}</h3>
                <p className="text-gray-600 mb-4">{selectedBranch.location}</p>
                <a
                  href={selectedBranch.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Get Directions <ArrowRight className="ml-1 w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Find Us Near You"
          subtitle="Visit any of our branches across Ghana for an unforgettable dining experience"
          light
        />

        {/* Location Status Indicator */}
        {locationStatus === "found" && userLocation && (
          <div className="flex items-center justify-center gap-2 mb-6 text-white/90">
            <Navigation className="w-4 h-4" />
            <span className="text-sm">Showing branches nearest to your location</span>
          </div>
        )}
        {locationStatus === "denied" && (
          <div className="flex items-center justify-center gap-2 mb-6 text-white/70">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Enable location to see branches nearest to you</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="text-white/80 text-sm">Detecting your location...</span>
          </div>
        ) : (
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 px-4 sm:px-0"
        >
          {nearestBranches.map((branch: Branch) => (
            <motion.div key={branch.id} variants={staggerItem}>
              <Card 
                className="group cursor-pointer overflow-hidden h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => handleBranchSelect(branch)}
              >
                {/* Embedded Google Map */}
                <div className="relative h-48 overflow-hidden">
                  {branch.mapUrl ? (
                    <iframe
                      src={branch.mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full pointer-events-none"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-heading font-bold text-xl drop-shadow-lg">{branch.name}</h3>
                    {branch.distance !== undefined && branch.distance < 9999 && (
                      <span className="text-sm text-white/90 drop-shadow">
                        {branch.distance < 1 
                          ? `${Math.round(branch.distance * 1000)}m away` 
                          : `${branch.distance.toFixed(1)} km away`}
                      </span>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{branch.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{branch.hours}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                      <a 
                        href={`tel:${branch.phone}`} 
                        className="text-gray-600 text-sm hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {branch.phone}
                      </a>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(branch.directionsUrl, '_blank');
                    }}
                  >
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        )}

        <div className="text-center">
          <Link href="/branches">
            <Button variant="secondary" size="lg" className="group">
              View All Branches
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
