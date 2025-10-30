/* eslint-disable @typescript-eslint/no-explicit-any */

export enum IApiRequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export interface IApiRequest {
  method: IApiRequestMethod;
  path: string;
  data?: any;
  headers?: any;
  params?: any;
}
