export class IApiPaginateRequest {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface IApiPagination {
  page: number;
  pages: number;
  total: number;
  per_page: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface IApiSort {
  field: string;
  order: string;
}

export interface IApiError {
  statusCode: number;
  message: string;
  error: string;
}
