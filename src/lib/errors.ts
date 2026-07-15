/**
 * Base API Error with structured response shape
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }

  toResponse() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.fieldErrors && { fieldErrors: this.fieldErrors }),
      },
    };
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    fieldErrors?: Record<string, string[]>
  ) {
    super("VALIDATION_ERROR", message, 400, fieldErrors);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id: string) {
    super("NOT_FOUND", `${resource} with id '${id}' not found`, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
    this.name = "ConflictError";
  }
}

export class InternalError extends ApiError {
  constructor(message = "An unexpected error occurred") {
    super("INTERNAL_ERROR", message, 500);
    this.name = "InternalError";
  }
}

/**
 * Helper to convert any error into a structured API response
 */
export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(error.toResponse(), { status: error.statusCode });
  }

  console.error("Unhandled API error:", error);
  const internal = new InternalError();
  return Response.json(internal.toResponse(), { status: 500 });
}
