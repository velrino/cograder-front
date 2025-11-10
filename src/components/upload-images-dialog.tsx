'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/contexts/i18n-context';
import { API } from '@/backend/api/api.request';
import { IApiUploadedFile } from '@/backend/api/interfaces/job';
import { toast } from 'sonner';

interface UploadState {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  uploadedData?: IApiUploadedFile;
  error?: string;
  preview?: string;
}

interface UploadImagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (files: IApiUploadedFile[]) => void;
}

export default function UploadImagesDialog({
  isOpen,
  onClose,
  onSuccess,
}: UploadImagesDialogProps) {
  const { t } = useI18n();
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Limite de 10 arquivos
    const currentCount = uploadStates.length;
    const availableSlots = 10 - currentCount;

    if (availableSlots <= 0) {
      toast.error(t('uploadDialog.maxFilesReached'));
      return;
    }

    // Pega apenas os arquivos que cabem no limite
    const filesToAdd = Array.from(files).slice(0, availableSlots);

    if (files.length > availableSlots) {
      toast.warning(
        t('uploadDialog.maxFilesWarning').replace('{{count}}', String(availableSlots))
      );
    }

    const newStates: UploadState[] = filesToAdd.map((file) => {
      // Create preview URL for image files
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      return {
        file,
        status: 'pending' as const,
        progress: 0,
        preview,
      };
    });

    setUploadStates((prev) => [...prev, ...newStates]);
  };

  // Cleanup preview URLs when component unmounts or states change
  useEffect(() => {
    return () => {
      uploadStates.forEach((state) => {
        if (state.preview) {
          URL.revokeObjectURL(state.preview);
        }
      });
    };
  }, [uploadStates]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setUploadStates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadStates.length === 0) return;

    // Pega apenas arquivos pending ou com erro
    const filesToUpload = uploadStates
      .filter((s) => s.status === 'pending' || s.status === 'error')
      .map((s) => s.file);

    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    // Marca todos como uploading
    setUploadStates((prev) =>
      prev.map((s) =>
        s.status === 'pending' || s.status === 'error'
          ? { ...s, status: 'uploading', progress: 0, error: undefined }
          : s
      )
    );

    try {
      // ENVIA TODOS OS ARQUIVOS EM UMA ÚNICA REQUEST
      const result = await API.jobs.upload(filesToUpload);

      // Check if result is an error
      if ('statusCode' in result && 'error' in result) {
        throw new Error(result.message || 'Upload failed');
      }

      // Marca todos como sucesso e atribui os dados retornados
      if (result.files && result.files.length > 0) {
        const uploadedFiles = result.files;

        // Mostra toast de sucesso
        toast.success(
          t('uploadDialog.successToast').replace('{{count}}', String(uploadedFiles.length))
        );

        // Chama callback de sucesso
        onSuccess(uploadedFiles);

        // Fecha o dialog
        handleClose();

        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('No file data returned');
      }
    } catch (error) {
      // Marca todos os arquivos que estavam uploading como erro
      setUploadStates((prev) =>
        prev.map((s) =>
          s.status === 'uploading'
            ? {
                ...s,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : s
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setUploadStates([]);
    setIsDragging(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: UploadState['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
        );
      case 'uploading':
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      case 'success':
        return (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
    }
  };

  const hasFailedUploads = uploadStates.some((s) => s.status === 'error');
  const hasPendingUploads = uploadStates.some(
    (s) => s.status === 'pending' || s.status === 'error'
  );
  const allSuccess = uploadStates.length > 0 && uploadStates.every((s) => s.status === 'success');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {t('uploadDialog.title')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            disabled={isUploading}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600'
            }`}
          >
            <svg
              className="w-12 h-12 mx-auto mb-4 text-zinc-400"
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
            <p className="text-lg font-medium text-black dark:text-white mb-1">
              {t('uploadDialog.dropZoneTitle')}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t('uploadDialog.dropZoneSubtitle')}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {/* File List */}
          {uploadStates.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('uploadDialog.filesCount')} ({uploadStates.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadStates.map((state, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                  >
                    {/* Image Preview */}
                    {state.preview && (
                      <div className="w-12 h-12 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                        <img
                          src={state.preview}
                          alt={state.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Status Icon */}
                    {getStatusIcon(state.status)}

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black dark:text-white truncate">
                        {state.file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <span>{formatFileSize(state.file.size)}</span>
                        {state.status === 'error' && state.error && (
                          <>
                            <span>•</span>
                            <span className="text-red-500">{state.error}</span>
                          </>
                        )}
                        {state.status === 'success' && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 dark:text-green-500">
                              {t('uploadDialog.uploadedSuccessfully')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {(state.status === 'pending' || state.status === 'error') && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        disabled={isUploading}
                      >
                        <svg
                          className="w-4 h-4 text-zinc-600 dark:text-zinc-400"
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Summary */}
          {hasFailedUploads && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {t('uploadDialog.errorSummary')}
              </p>
            </div>
          )}

          {/* Success Summary */}
          {allSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                {t('uploadDialog.successSummary')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            disabled={isUploading}
          >
            {allSuccess ? t('uploadDialog.done') : t('uploadDialog.cancel')}
          </button>
          {hasPendingUploads && (
            <button
              onClick={handleUpload}
              disabled={isUploading || uploadStates.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              {isUploading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isUploading ? t('uploadDialog.uploading') : t('uploadDialog.uploadFiles')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
