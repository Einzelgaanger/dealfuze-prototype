import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs } from "@remix-run/node";

import dotenv from "dotenv";

dotenv.config();

// Use environment variable for API URL in production, fallback to localhost for development
const API_URL = process.env.API_URL || "http://localhost:7777/api";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface APIOptions<TRequest = unknown>
  extends Omit<RequestInit, "body" | "method"> {
  auth?: boolean;
  data?: TRequest;
  token?: string;
  loaderArgs?: LoaderFunctionArgs;
}

export class APIError extends Error {
  public status: number;
  public data?: unknown;

  constructor(status: number, message?: string, data?: unknown) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

async function fetchWithAuth<TResponse, TRequest>(
  endpoint: string,
  method: HTTPMethod,
  { data, token, ...options }: APIOptions<TRequest> = {}
): Promise<TResponse> {
  const url = `${API_URL}${endpoint}`;

  console.log('Making API request to:', url);

  if (!token && options.loaderArgs) {
    const { getToken } = await getAuth(options.loaderArgs);
    const t = await getToken();

    if (t) {
      token = t;
    }
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  try {
    const response = await fetch(url, {
      ...options,
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const responseData = await response.json().catch(() => ({}));
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        url
      });
      throw new APIError(response.status, responseData.error || response.statusText, responseData);
    }

    const responseData = await response.json().catch(() => ({}));
    return responseData;
  } catch (error) {
    console.error('Fetch Error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      cause: error instanceof Error ? error.cause : undefined,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export const api = {
  get: <TResponse = void>(
    endpoint: string,
    options?: Omit<APIOptions<never>, "data">
  ) => fetchWithAuth<TResponse, never>(endpoint, "GET", options),

  post: <TRequest, TResponse>(
    endpoint: string,
    options?: APIOptions<TRequest>
  ) => fetchWithAuth<TResponse, TRequest>(endpoint, "POST", options),

  put: <TRequest, TResponse = void>(
    endpoint: string,
    options?: APIOptions<TRequest>
  ) => fetchWithAuth<TResponse, TRequest>(endpoint, "PUT", options),

  delete: <TRequest, TResponse = void>(
    endpoint: string,
    options?: APIOptions<TRequest>
  ) => fetchWithAuth<TResponse, TRequest>(endpoint, "DELETE", options),

  patch: <TRequest, TResponse = void>(
    endpoint: string,
    options?: APIOptions<TRequest>
  ) => fetchWithAuth<TResponse, TRequest>(endpoint, "PATCH", options),
};
