import { HttpContextToken } from '@angular/common/http';

// Here we are creating a new HttpContextToken called SKIP_ERROR_HANDLING. This token is used to determine whether to skip error handling for a specific HTTP request. By default, it is set to false, meaning that error handling will be applied unless explicitly overridden in the request context.
export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);
