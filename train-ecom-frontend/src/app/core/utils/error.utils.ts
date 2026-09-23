export function extractBackendMessage(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (!error) return fallbackMessage;

  // 1. Direct string error
  if (typeof error === 'string') {
    return error.trim() || fallbackMessage;
  }

  // 2. Extract nested error body
  const errObj = error as Record<string, unknown>;
  const body = errObj['error'] ?? error;

  // 3. String body
  if (typeof body === 'string' && body.trim().length > 0) {
    if (body.startsWith('<')) {
      return fallbackMessage;
    }
    return body;
  }

  // 4. Object body
  if (typeof body === 'object' && body !== null) {
    const b = body as Record<string, unknown>;
    // Check Message (Capital M)
    if (b['Message'] && typeof b['Message'] === 'string' && (b['Message'] as string).trim()) {
      return b['Message'] as string;
    }
    // Check message (lowercase m)
    if (b['message'] && typeof b['message'] === 'string' && (b['message'] as string).trim()) {
      return b['message'] as string;
    }
    // Check detail
    if (b['detail'] && typeof b['detail'] === 'string' && (b['detail'] as string).trim()) {
      return b['detail'] as string;
    }
    // Check title
    if (b['title'] && typeof b['title'] === 'string' && (b['title'] as string).trim()) {
      return b['title'] as string;
    }
    // Check errors dictionary
    if (b['errors'] && typeof b['errors'] === 'object') {
      const messages: string[] = [];
      const errorsDict = b['errors'] as Record<string, unknown>;
      for (const key of Object.keys(errorsDict)) {
        const val = errorsDict[key];
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
  if (errObj['status'] === 0 || (typeof errObj['message'] === 'string' && (errObj['message'] as string).includes('0 Unknown Error'))) {
    return 'Unable to connect to the server. Please check your internet connection or try again later.';
  }

  // 6. Direct error.message fallback if non-generic
  if (typeof errObj['message'] === 'string' && (errObj['message'] as string).trim() && !(errObj['message'] as string).includes('Http failure response')) {
    return errObj['message'] as string;
  }

  return fallbackMessage;
}

