import { IApiRequest } from "./api.interface";

export class ApiResources {
  // Request para API
  static async request(config: IApiRequest) {
    const url = `${process.env.NEXT_PUBLIC_BASE_API_URL?.concat(config.path)}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    const fetchConfig: RequestInit = {
      method: config.method,
      headers,
    };

    // Adicionar body para métodos POST/PUT/PATCH
    if (config.method !== "GET" && config.data) {
      fetchConfig.body = JSON.stringify(config.data);
    }

    // Adicionar query parameters para GET
    if (config.method === "GET" && config.params) {
      const urlWithParams = new URL(url);
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlWithParams.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(urlWithParams.toString(), fetchConfig);
      const responseData = await response.json();
      return responseData;
    }

    const response = await fetch(url, fetchConfig);
    const responseData = await response.json();
    return responseData;
  }
}
