/**
 * Standard error format, per the Engineering Constitution:
 * "Every error response from every endpoint follows the same structure:
 * { error: { code, message, field? } }. No freeform error strings."
 */
export class ApiError extends Error {
  constructor(statusCode, code, message, field, cause) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.cause = cause;
  }

  toBody() {
    const body = { error: { code: this.code, message: this.message } };
    if (this.field) body.error.field = this.field;
    return body;
  }
}

export function sendApiError(reply, err) {
  if (err instanceof ApiError) {
    // Any 500-level ApiError still represents a genuine unexpected
    // failure (a Supabase call that errored, etc.) - the code/message
    // sent to the client is intentionally generic per the Constitution,
    // but silently dropping the real cause here made this exact class
    // of bug (a real Supabase error surfacing only as a bare 500 with
    // no way to diagnose it) invisible in the logs. 4xx ApiErrors are
    // expected/handled cases (validation, not-found, etc.) and stay
    // unlogged as before.
    if (err.statusCode >= 500) {
      reply.log?.error?.({ code: err.code, cause: err.cause ?? err.message }, 'ApiError (5xx)');
    }
    return reply.status(err.statusCode).send(err.toBody());
  }
  // Unexpected error - never leak internals, still follow the standard shape.
  reply.log?.error?.(err);
  return reply.status(500).send({
    error: { code: 'internal_error', message: 'Something went wrong. Please try again.' },
  });
}
