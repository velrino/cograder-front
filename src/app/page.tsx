'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import ImageCard from '@/components/image-card';
import { subscribeToDevImages, DevImage } from '@/services/firebase';

export default function Home() {
  const [images, setImages] = useState<DevImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToDevImages((newImages) => {
      setImages(newImages);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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
    </div>
  );
}
