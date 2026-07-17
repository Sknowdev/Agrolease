/**
 * Standard error format, per the Engineering Constitution:
 * "Every error response from every endpoint follows the same structure:
 * { error: { code, message, field? } }. No freeform error strings."
 */
export class ApiError extends Error {
  constructor(statusCode, code, message, field) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
  }

  toBody() {
    const body = { error: { code: this.code, message: this.message } };
    if (this.field) body.error.field = this.field;
    return body;
  }
}

export function sendApiError(reply, err) {
  if (err instanceof ApiError) {
    return reply.status(err.statusCode).send(err.toBody());
  }
  // Unexpected error - never leak internals, still follow the standard shape.
  reply.log?.error?.(err);
  return reply.status(500).send({
    error: { code: 'internal_error', message: 'Something went wrong. Please try again.' },
  });
}
