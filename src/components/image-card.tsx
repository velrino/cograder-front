'use client';

import { DevImage } from '@/services/firebase';
import { IApiJobStatus } from '@/backend/api/interfaces/job';

interface ImageCardProps {
  image: DevImage;
}

export default function ImageCard({ image }: ImageCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case IApiJobStatus.COMPLETED:
        return 'bg-green-500';
      case IApiJobStatus.ACTIVE:
        return 'bg-blue-500';
      case IApiJobStatus.FAILED:
        return 'bg-red-500';
      case IApiJobStatus.WAITING:
        return 'bg-yellow-500';
      case IApiJobStatus.DELAYED:
        return 'bg-orange-500';
      case IApiJobStatus.PAUSED:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-mono text-zinc-600 dark:text-zinc-400 truncate">
              {image.id}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              {formatDate(image.timestamp)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap ${getStatusColor(image.status)}`}>
            {image.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Progress
            </span>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {image.progress}%
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getStatusColor(image.status)}`}
              style={{ width: `${image.progress}%` }}
            />
          </div>
        </div>

        {/* Images Side by Side */}
        {(image.originalUrl || image.resultUrl) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original Image */}
            {image.originalUrl && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Original
                </span>
                <a
                  href={image.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-64 sm:h-80 md:h-96 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={image.originalUrl}
                    alt={`Original image ${image.id}`}
                    className="max-w-full max-h-full object-contain hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                </a>
              </div>
            )}

            {/* Result Image */}
            {image.resultUrl && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Result
                </span>
                <a
                  href={image.resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-64 sm:h-80 md:h-96 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={image.resultUrl}
                    alt={`Processed image ${image.id}`}
                    className="max-w-full max-h-full object-contain hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
