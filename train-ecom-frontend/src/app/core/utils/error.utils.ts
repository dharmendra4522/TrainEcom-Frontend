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
    const errorBdy = body as Record<string, unknown>;
    // Check Message (Capital M)
    if (errorBdy['Message'] && typeof errorBdy['Message'] === 'string' && (errorBdy['Message'] as string).trim()) {
      return errorBdy['Message'] as string;
    }
    // Check message (lowercase m)
    if (errorBdy['message'] && typeof errorBdy['message'] === 'string' && (errorBdy['message'] as string).trim()) {
      return errorBdy['message'] as string;
    }
    // Check detail
    if (errorBdy['detail'] && typeof errorBdy['detail'] === 'string' && (errorBdy['detail'] as string).trim()) {
      return errorBdy['detail'] as string;
    }
    // Check title
    if (errorBdy['title'] && typeof errorBdy['title'] === 'string' && (errorBdy['title'] as string).trim()) {
      return errorBdy['title'] as string;
    }
    // Check errors dictionary
    if (errorBdy['errors'] && typeof errorBdy['errors'] === 'object') {
      const messages: string[] = [];
      const errorsDict = errorBdy['errors'] as Record<string, unknown>;
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

