/**
 * Utility function to extract exact backend error messages.
 * Handles all backend response casings and formats:
 * - { "Message": "You are blocked by TrainEcom Service..." } (Capital 'M')
 * - { "message": "Invalid password" } (Lowercase 'm')
 * - { "detail": "..." } or { "title": "..." } (ProblemDetails format)
 * - { "errors": { "Field": ["Error msg"] } } (ASP.NET ModelState / FluentValidation)
 * - Plain string responses
 */
export function extractBackendMessage(error: any, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (!error) return fallbackMessage;

  // 1. Direct string error
  if (typeof error === 'string') {
    return error.trim() || fallbackMessage;
  }

  // 2. Extract nested error body
  const body = error.error ?? error;

  // 3. String body
  if (typeof body === 'string' && body.trim().length > 0) {
    if (body.startsWith('<')) {
      return fallbackMessage;
    }
    return body;
  }

  // 4. Object body
  if (typeof body === 'object' && body !== null) {
    // Check Message (Capital M)
    if (body.Message && typeof body.Message === 'string' && body.Message.trim()) {
      return body.Message;
    }
    // Check message (lowercase m)
    if (body.message && typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    // Check detail
    if (body.detail && typeof body.detail === 'string' && body.detail.trim()) {
      return body.detail;
    }
    // Check title
    if (body.title && typeof body.title === 'string' && body.title.trim()) {
      return body.title;
    }
    // Check errors dictionary
    if (body.errors && typeof body.errors === 'object') {
      const messages: string[] = [];
      for (const key of Object.keys(body.errors)) {
        const val = body.errors[key];
        if (Array.isArray(val)) {
          messages.push(...val);
        } else if (typeof val === 'string') {
          messages.push(val);
        }
      }
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }
  }

  // 5. Connection refused / Server down check
  if (error.status === 0 || (error.message && typeof error.message === 'string' && error.message.includes('0 Unknown Error'))) {
    return 'Unable to connect to the server. Please check your internet connection or try again later.';
  }

  // 6. Direct error.message fallback if non-generic
  if (error.message && typeof error.message === 'string' && error.message.trim() && !error.message.includes('Http failure response')) {
    return error.message;
  }

  return fallbackMessage;
}
