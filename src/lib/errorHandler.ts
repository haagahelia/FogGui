export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

export function getStatusCode(error: unknown): number {
  if (error instanceof ApiError) {
    return error.statusCode;
  }
  return 500;
}

export function createErrorResponse(error: unknown) {
  const message = getErrorMessage(error);
  const statusCode = getStatusCode(error);

  return new Response(JSON.stringify({ error: message }), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
