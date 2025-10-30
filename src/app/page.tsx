'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/navbar';
import ImageCard from '@/components/image-card';
import { fetchDevImages, DevImage } from '@/services/firebase';

export default function Home() {
  const [images, setImages] = useState<DevImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const PAGE_SIZE = 10;

  const loadInitialImages = async () => {
    setLoading(true);
    const initialImages = await fetchDevImages({ pageSize: PAGE_SIZE });
    setImages(initialImages);
    setHasMore(initialImages.length === PAGE_SIZE);
    setLoading(false);
  };

  const loadMoreImages = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const lastTimestamp = images[images.length - 1]?.timestamp;

    if (!lastTimestamp) {
      setLoadingMore(false);
      return;
    }

    const newImages = await fetchDevImages({
      pageSize: PAGE_SIZE,
      lastTimestamp,
    });

    if (newImages.length === 0) {
      setHasMore(false);
    } else {
      setImages((prev) => [...prev, ...newImages]);
      setHasMore(newImages.length === PAGE_SIZE);
    }

    setLoadingMore(false);
  }, [images, loadingMore, hasMore]);

  useEffect(() => {
    loadInitialImages();
  }, []);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadMoreImages();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreImages, loadingMore, hasMore]);

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
          <>
            <div className="flex flex-col gap-4">
              {images.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    <span>Loading more...</span>
                  </div>
                )}
              </div>
            )}

            {!hasMore && images.length > 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  No more images to load
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
