/**
 * Structured API errors. Every error response uses the canonical shape:
 * { code, message, requestId, fieldErrors? } (docs/MASTER_PLAN.md).
 */

export type ErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'unprocessable'
  | 'payload_too_large'
  | 'rate_limited'
  | 'internal';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  unprocessable: 422,
  payload_too_large: 413,
  rate_limited: 429,
  internal: 500,
};

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fieldErrors?: FieldError[];

  constructor(code: ErrorCode, message: string, fieldErrors?: FieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.fieldErrors = fieldErrors;
  }

  static badRequest(message = 'Bad request', fieldErrors?: FieldError[]): ApiError {
    return new ApiError('bad_request', message, fieldErrors);
  }
  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError('unauthorized', message);
  }
  static forbidden(message = 'You do not have access to this resource'): ApiError {
    return new ApiError('forbidden', message);
  }
  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError('not_found', message);
  }
  static conflict(message = 'Conflict with the current state'): ApiError {
    return new ApiError('conflict', message);
  }
  static unprocessable(message = 'The request cannot be processed', fieldErrors?: FieldError[]): ApiError {
    return new ApiError('unprocessable', message, fieldErrors);
  }
  static payloadTooLarge(message = 'Request body too large'): ApiError {
    return new ApiError('payload_too_large', message);
  }
  static rateLimited(message = 'Too many requests, try again later'): ApiError {
    return new ApiError('rate_limited', message);
  }
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError('internal', message);
  }
}
