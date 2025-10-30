'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import ImageCard from '@/components/image-card';
import CreateJobDialog from '@/components/create-job-dialog';
import { subscribeToDevImages, DevImage } from '@/services/firebase';

export default function Home() {
  const [images, setImages] = useState<DevImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Processed Images
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Real-time updates from Firebase
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
          </div>
        ) : images.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-600 dark:text-zinc-400">No images found</div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {images.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        )}
      </main>

      {/* FAB Button */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
        aria-label="Add new image"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Create Job Dialog */}
      <CreateJobDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleJobSuccess}
      />
    </div>
  );
}
