export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: { code: string; details?: unknown };
};

export function ok<T>(message: string, data?: T): ApiResponse<T> {
  return { success: true, message, data };
}

export function fail(message: string, code: string, details?: unknown): ApiResponse<never> {
  return { success: false, message, error: { code, details } };
}
