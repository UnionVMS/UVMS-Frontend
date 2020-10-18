
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { map, filter, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    // send token for all requests except login
    let authReq: HttpRequest<any> = request;
    if (!request.url.includes('authentication/authenticate')) {
      const TOKEN = localStorage.getItem('token');
      authReq = request.clone({ setHeaders: { Authorization: TOKEN } });
    }
    return next.handle(authReq).pipe(
      tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            const authorizationHeader = event.headers.get('Authorization');
            if (authorizationHeader) {
              localStorage.setItem('token', authorizationHeader);
            }
          }
        }, (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401 || err.status === 403) {
              // redirect to old signin page
              window.location.href = `${environment.oldBaseURL}/#/login`;
            }
          }
        })
      );
  }
}
