"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/navbar";
import ImageCard from "@/components/image-card";
import BatchCard from "@/components/batch-card";
import CreateJobDialog from "@/components/create-job-dialog";
import UploadImagesDialog from "@/components/upload-images-dialog";
import { subscribeToDevImages, DevImage } from "@/services/firebase";
import { useI18n } from "@/contexts/i18n-context";

export default function Home() {
  const { t } = useI18n();
  const [images, setImages] = useState<DevImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Group images by batchId and create unified sorted list
  const sortedItems = useMemo(() => {
    const batchMap = new Map<string, DevImage[]>();
    const individual: DevImage[] = [];

    // Separate batches and individual images
    images.forEach((image) => {
      if (image.batchId) {
        if (!batchMap.has(image.batchId)) {
          batchMap.set(image.batchId, []);
        }
        batchMap.get(image.batchId)!.push(image);
      } else {
        individual.push(image);
      }
    });

    // Create array of items with type and timestamp for sorting
    const items: Array<{
      type: 'batch' | 'individual';
      timestamp: number;
      data: { batchId: string; images: DevImage[] } | DevImage;
    }> = [];

    // Add batches with their latest timestamp
    batchMap.forEach((imgs, batchId) => {
      items.push({
        type: 'batch',
        timestamp: Math.max(...imgs.map((img) => img.timestamp)),
        data: { batchId, images: imgs },
      });
    });

    // Add individual images with their timestamp
    individual.forEach((image) => {
      items.push({
        type: 'individual',
        timestamp: image.timestamp,
        data: image,
      });
    });

    // Sort all items by timestamp descending (newest first)
    items.sort((a, b) => b.timestamp - a.timestamp);

    return items;
  }, [images]);

  useEffect(() => {
    // Set page title
    document.title = `${t("home.title")} - CoGrader`;

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("home.subtitle"));
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = t("home.subtitle");
      document.head.appendChild(meta);
    }
  }, [t]);

  useEffect(() => {
    const unsubscribe = subscribeToDevImages((newImages) => {
      setImages(newImages);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleJobSuccess = () => {
    // No need to reload - real-time subscription will update automatically
    setIsDialogOpen(false);
  };

  const handleUploadSuccess = (files: any[]) => {
    console.log('Files uploaded successfully:', files);
    // Files will appear automatically via real-time subscription
    setIsUploadDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            {t("home.title")}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {t("home.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-600 dark:text-zinc-400">
              {t("home.loading")}
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-600 dark:text-zinc-400">
              {t("home.noImages")}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedItems.map((item) =>
              item.type === 'batch' ? (
                <BatchCard
                  key={(item.data as { batchId: string; images: DevImage[] }).batchId}
                  batchId={(item.data as { batchId: string; images: DevImage[] }).batchId}
                  images={(item.data as { batchId: string; images: DevImage[] }).images}
                />
              ) : (
                <ImageCard
                  key={(item.data as DevImage).id}
                  image={item.data as DevImage}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* FAB Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        {/* Upload Files Button */}
        <button
          onClick={() => setIsUploadDialogOpen(true)}
          className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group relative"
          aria-label="Upload Images"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="absolute right-16 px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Upload Files
          </span>
        </button>

        {/* Add URL Button */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group relative"
          aria-label={t("home.addImageButton")}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span className="absolute right-16 px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Add URL
          </span>
        </button>
      </div>

      {/* Create Job Dialog */}
      <CreateJobDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleJobSuccess}
      />

      {/* Upload Images Dialog */}
      <UploadImagesDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
