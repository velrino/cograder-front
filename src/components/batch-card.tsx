'use client';

import { useState } from 'react';
import { DevImage } from '@/services/firebase';
import ImageCard from './image-card';

interface BatchCardProps {
  batchId: string;
  images: DevImage[];
}

export default function BatchCard({ batchId, images }: BatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate batch statistics
  const totalImages = images.length;
  const completedImages = images.filter((img) => img.status === 'completed').length;
  const failedImages = images.filter((img) => img.status === 'failed').length;
  const avgProgress =
    images.reduce((sum, img) => sum + img.progress, 0) / totalImages;

  const getOverallStatus = () => {
    if (failedImages > 0 && completedImages === 0) return 'failed';
    if (completedImages === totalImages) return 'completed';
    if (avgProgress > 0) return 'processing';
    return 'waiting';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'waiting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const status = getOverallStatus();
  const shortBatchId = batchId.substring(0, 8);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Batch Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex-1 flex items-center gap-4">
          {/* Expand Icon */}
          <svg
            className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>

          {/* Batch Info */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Batch {shortBatchId}...
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                  status
                )}`}
              >
                {status}
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {totalImages} image{totalImages !== 1 ? 's' : ''} • {completedImages}{' '}
              completed • {failedImages} failed
            </p>
          </div>

          {/* Progress */}
          <div className="hidden md:flex flex-col items-end gap-2 min-w-[200px]">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {Math.round(avgProgress)}%
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStatusColor(
                  status
                )}`}
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Images */}
      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <div className="flex flex-col gap-4">
            {images.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
