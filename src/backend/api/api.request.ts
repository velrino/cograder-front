import { IApiRequestMethod } from "./api.interface";
import { ApiResources } from "./api.resources";
import { IApiError } from "./interfaces/common";
import { IApiJob, IApiJobCreateRequest } from "./interfaces/job";

export const API = {
  jobs: {
    async create(data: IApiJobCreateRequest): Promise<IApiJob | IApiError> {
      return await ApiResources.request({
        method: IApiRequestMethod.POST,
        path: "/api/jobs",
        data,
      });
    },
  },
};
