import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:4000/api";

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

  console.log(url);

  if (!token && options.loaderArgs) {
    const { getToken } = await getAuth(options.loaderArgs);
    const t = await getToken();

    if (t) {
      token = t;
    }
  }

  const headers = new Headers({
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.log(responseData);
    throw new APIError(response.status, responseData.error, responseData);
  }

  return responseData;
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
