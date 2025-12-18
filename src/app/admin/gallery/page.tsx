"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Image as ImageIcon,
  FolderOpen,
  Upload,
} from "lucide-react";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
}

interface Album {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  sortOrder: number;
  isActive: boolean;
  images: GalleryImage[];
  _count?: { images: number };
}

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [saving, setSaving] = useState(false);

  const [albumFormData, setAlbumFormData] = useState({
    name: "",
    description: "",
    coverImage: "",
    isActive: true,
  });

  const [imageFormData, setImageFormData] = useState({
    imageUrl: "",
    caption: "",
  });

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await fetch("/api/admin/gallery");
      const data = await response.json();
      setAlbums(data);
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAlbumModal = (album?: Album) => {
    if (album) {
      setEditingAlbum(album);
      setAlbumFormData({
        name: album.name,
        description: album.description || "",
        coverImage: album.coverImage || "",
        isActive: album.isActive,
      });
    } else {
      setEditingAlbum(null);
      setAlbumFormData({
        name: "",
        description: "",
        coverImage: "",
        isActive: true,
      });
    }
    setIsAlbumModalOpen(true);
  };

  const openImageModal = (album: Album) => {
    setSelectedAlbum(album);
    setImageFormData({ imageUrl: "", caption: "" });
    setIsImageModalOpen(true);
  };

  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingAlbum
        ? `/api/admin/gallery/${editingAlbum.id}`
        : "/api/admin/gallery";
      const method = editingAlbum ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(albumFormData),
      });

      if (!response.ok) throw new Error("Failed to save");

      await fetchAlbums();
      setIsAlbumModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save album");
    } finally {
      setSaving(false);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || !imageFormData.imageUrl) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/gallery/${selectedAlbum.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageFormData),
      });

      if (!response.ok) throw new Error("Failed to save");

      await fetchAlbums();
      setImageFormData({ imageUrl: "", caption: "" });
      // Keep modal open to add more images
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to add image");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("Are you sure you want to delete this album and all its images?")) return;

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      await fetchAlbums();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete album");
    }
  };

  const handleDeleteImage = async (albumId: string, imageId: string) => {
    try {
      const response = await fetch(`/api/admin/gallery/${albumId}/images/${imageId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      await fetchAlbums();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete image");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Gallery</h1>
          <p className="text-gray-600">Manage photo albums and images</p>
        </div>
        <Button onClick={() => openAlbumModal()} className="gap-2">
          <Plus className="w-5 h-5" />
          Create Album
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album, index) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={!album.isActive ? "opacity-60" : ""}>
              <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gray-100">
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                ) : album.images?.[0]?.imageUrl ? (
                  <img
                    src={album.images[0].imageUrl}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    album.isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {album.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg">{album.name}</h3>
                {album.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{album.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  {album._count?.images || album.images?.length || 0} images
                </p>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openImageModal(album)}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Add Images
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAlbumModal(album)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteAlbum(album.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No albums yet</p>
          <Button onClick={() => openAlbumModal()} className="mt-4">
            Create First Album
          </Button>
        </div>
      )}

      {/* Album Modal */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingAlbum ? "Edit Album" : "Create Album"}
              </h2>
              <button
                onClick={() => setIsAlbumModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAlbumSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Album Name *
                </label>
                <input
                  type="text"
                  required
                  value={albumFormData.name}
                  onChange={(e) => setAlbumFormData({ ...albumFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Restaurant Interior"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={albumFormData.description}
                  onChange={(e) => setAlbumFormData({ ...albumFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <ImageUpload
                  value={albumFormData.coverImage}
                  onChange={(url) => setAlbumFormData({ ...albumFormData, coverImage: url })}
                  folder="gallery"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={albumFormData.isActive}
                  onChange={(e) => setAlbumFormData({ ...albumFormData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Active</span>
              </label>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAlbumModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Image Upload Modal */}
      {isImageModalOpen && selectedAlbum && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                Add Images to &quot;{selectedAlbum.name}&quot;
              </h2>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Existing Images */}
              {selectedAlbum.images && selectedAlbum.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Current Images ({selectedAlbum.images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedAlbum.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image.imageUrl}
                            alt={image.caption || "Gallery image"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteImage(selectedAlbum.id, image.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {image.caption && (
                          <p className="text-xs text-gray-500 mt-1 truncate">{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Image */}
              <form onSubmit={handleImageSubmit} className="space-y-4">
                <h3 className="font-medium">Add New Image</h3>
                
                <ImageUpload
                  value={imageFormData.imageUrl}
                  onChange={(url) => setImageFormData({ ...imageFormData, imageUrl: url })}
                  folder="gallery"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={imageFormData.caption}
                    onChange={(e) => setImageFormData({ ...imageFormData, caption: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe this image..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={saving || !imageFormData.imageUrl}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Image
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsImageModalOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
