import { IApiRequestMethod } from "./api.interface";
import { ApiResources } from "./api.resources";
import { IApiError } from "./interfaces/common";
import { IApiJob, IApiJobCreateRequest, IApiUploadResponse } from "./interfaces/job";

export const API = {
  jobs: {
    async create(data: IApiJobCreateRequest): Promise<IApiJob | IApiError> {
      return await ApiResources.request({
        method: IApiRequestMethod.POST,
        path: "/api/jobs",
        data,
      });
    },

    async upload(files: File[]): Promise<IApiUploadResponse | IApiError> {
      const formData = new FormData();

      // Adiciona todos os arquivos no mesmo FormData
      files.forEach(file => {
        formData.append('files', file);
      });

      const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/jobs/upload`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          return {
            statusCode: response.status,
            message: errorData.message || 'Upload failed',
            error: errorData.error || 'Bad Request',
          } as IApiError;
        }

        const result = await response.json();
        return result as IApiUploadResponse;
      } catch (error) {
        return {
          statusCode: 500,
          message: error instanceof Error ? error.message : 'Upload failed',
          error: 'Internal Server Error',
        } as IApiError;
      }
    },
  },
};
