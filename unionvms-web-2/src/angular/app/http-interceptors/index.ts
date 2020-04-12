import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { ExtraHeadersInterceptor } from './extra-headers.interceptor';

export const HTTP_INTERCEPT_PROVIDERS = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ExtraHeadersInterceptor, multi: true }
];
