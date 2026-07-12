import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

export interface ApiSuccessBody<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error: {
    code?: string;
    details?: unknown;
  };
}

export type ApiResponseBody<T> = ApiSuccessBody<T> | ApiErrorBody;

// Every app/api/** route handler should return through one of these two
// helpers instead of calling NextResponse.json directly, so every response
// on the wire has the same { success, message, data } / { success, message,
// error } shape regardless of which route produced it.
export function apiSuccess<T>(
  data: T,
  message = "OK",
  status: number = StatusCodes.OK,
): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function apiError(
  message: string,
  options?: { status?: number; code?: string; details?: unknown },
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: { code: options?.code, details: options?.details },
    },
    { status: options?.status ?? StatusCodes.BAD_REQUEST },
  );
}
