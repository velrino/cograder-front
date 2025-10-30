'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/i18n-context';
import { API } from '@/backend/api/api.request';
import { IApiError } from '@/backend/api/interfaces/common';

interface CreateJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateJobDialog({ isOpen, onClose, onSuccess }: CreateJobDialogProps) {
  const { t } = useI18n();
  const [imageUrl, setImageUrl] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validateImageUrl = async (url: string) => {
    if (!url.trim()) {
      setImagePreview(null);
      setImageError(null);
      setIsLoadingImage(false);
      return;
    }

    setIsLoadingImage(true);
    setImageError(null);
    setImagePreview(null);

    try {
      // Create a hidden image to test if URL is valid
      const img = new Image();

      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      img.src = url;
      await loadPromise;

      // If we got here, image loaded successfully
      setImagePreview(url);
      setImageError(null);
    } catch (error) {
      setImageError(t('createJobDialog.errors.invalidUrl'));
      setImagePreview(null);
    } finally {
      setIsLoadingImage(false);
    }
  };

  useEffect(() => {
    // Clear timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If URL is empty, reset immediately
    if (!imageUrl.trim()) {
      setImagePreview(null);
      setImageError(null);
      setIsLoadingImage(false);
      return;
    }

    // Otherwise, debounce validation
    debounceTimerRef.current = setTimeout(() => {
      validateImageUrl(imageUrl);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [imageUrl]);

  const handleSubmit = async () => {
    if (!imageUrl.trim()) {
      setSubmitError(t('createJobDialog.errors.emptyUrl'));
      return;
    }

    if (!imagePreview) {
      setSubmitError(t('createJobDialog.errors.invalidUrl'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await API.jobs.create({ imageUrl });

      // Check if result is an error
      if ('statusCode' in result && 'error' in result) {
        const error = result as IApiError;
        setSubmitError(`${t('createJobDialog.errors.apiError')}: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      // Success
      onSuccess();
      handleClose();
    } catch (error) {
      setSubmitError(t('createJobDialog.errors.apiError'));
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setImageUrl('');
    setImagePreview(null);
    setImageError(null);
    setSubmitError(null);
    setIsLoadingImage(false);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {t('createJobDialog.title')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            disabled={isSubmitting}
          >
            <svg
              className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('createJobDialog.urlLabel')}
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t('createJobDialog.urlPlaceholder')}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Loading State */}
          {isLoadingImage && (
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">{t('createJobDialog.loadingImage')}</span>
            </div>
          )}

          {/* Image Error */}
          {imageError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{imageError}</p>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('createJobDialog.imagePreview')}
              </label>
              <div className="w-full max-h-64 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-64 object-contain"
                />
              </div>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            {t('createJobDialog.cancelButton')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!imagePreview || isSubmitting || isLoadingImage}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSubmitting ? t('createJobDialog.submitting') : t('createJobDialog.submitButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
