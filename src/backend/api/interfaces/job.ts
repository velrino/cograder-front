export enum IApiJobStatus {
  COMPLETED = "completed",
  WAITING = "waiting",
  ACTIVE = "active",
  DELAYED = "delayed",
  FAILED = "failed",
  PAUSED = "paused",
}

export interface IApiJob {
  id: string;
  imageUrl: string;
  status: IApiJobStatus;
  progress: number;
  originalUrl?: string;
  resultUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IApiJobPaginateResponse {
  data: IApiJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IApiJobPaginateRequest {
  limit?: number;
  page?: number;
  orderBy?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface IApiJobCreateRequest {
  imageUrl: string;
}

export interface IApiJobGetRequest {
  id: string;
}

export interface IApiUploadedFile {
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  storagePath: string;
}

export interface IApiUploadResponse {
  files: IApiUploadedFile[];
  failed?: string[];
  batchId: string;
}
