"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/modal";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { X, ChevronLeft, ChevronRight, ZoomIn, Loader2 } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  albumName?: string;
}

interface Album {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  images: GalleryImage[];
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery");
      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get all images with album info
  const allImages: GalleryImage[] = albums.flatMap(album => 
    album.images.map(img => ({ ...img, albumName: album.name }))
  );

  const filteredImages = activeAlbum === "all"
    ? allImages
    : albums.find(a => a.slug === activeAlbum)?.images || [];

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(filteredImages[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(filteredImages[prevIndex]);
  };

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
              📸 Visual Journey
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-4">
              Our Gallery
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Take a visual tour of our restaurants, delicious dishes, and the
              moments that make Papaye special.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section ref={ref} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Album Filter */}
          {loading ? (
            <div className="flex justify-center mb-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              <Button
                variant={activeAlbum === "all" ? "default" : "outline"}
                onClick={() => setActiveAlbum("all")}
                className="rounded-full"
              >
                All
              </Button>
              {albums.map((album) => (
                <Button
                  key={album.id}
                  variant={activeAlbum === album.slug ? "default" : "outline"}
                  onClick={() => setActiveAlbum(album.slug)}
                  className="rounded-full"
                >
                  {album.name}
                </Button>
              ))}
            </motion.div>
          )}

          {/* Masonry Grid */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  variants={staggerItem}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="break-inside-avoid"
                >
                  <div
                    className="relative group cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20"
                    onClick={() => openLightbox(image, index)}
                    style={{
                      height: `${200 + (index % 3) * 100}px`,
                    }}
                  >
                    {/* Image */}
                    {image.url ? (
                      <Image
                        src={image.url}
                        alt={image.caption || "Gallery image"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4">
                          <div className="text-4xl mb-2">📷</div>
                          <p className="text-gray-600 font-medium">{image.caption}</p>
                        </div>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                        <ZoomIn className="w-10 h-10 mx-auto mb-2" />
                        <p className="font-medium">{image.caption}</p>
                        {image.albumName && (
                          <span className="text-sm text-white/70">{image.albumName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          <VisuallyHidden>
            <DialogTitle>Gallery Image</DialogTitle>
          </VisuallyHidden>
          {selectedImage && (
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center relative">
                {selectedImage.url ? (
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.caption || "Gallery image"}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="text-center text-white">
                    <div className="text-8xl mb-4">📷</div>
                    <h3 className="text-2xl font-bold font-heading">{selectedImage.caption}</h3>
                  </div>
                )}
              </div>

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {currentIndex + 1} / {filteredImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
