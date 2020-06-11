import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class ExtraHeadersInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const scopeName = localStorage.getItem('scopeName');
    const roleName = localStorage.getItem('roleName');

    const authReq = request.clone({
      setHeaders: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
        roleName,
        scopeName,
        'If-Modified-Since' : 'Mon, 26 Jul 1997 05:00:00 GMT'
    }
    });
    return next.handle(authReq);
  }
}
