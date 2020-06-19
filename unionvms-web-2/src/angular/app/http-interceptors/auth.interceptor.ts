
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { map, filter, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    console.log('Auth interceptor');
    console.log(request.url);
    // send token for all requests except login
    let authReq: HttpRequest<any> = request;
    if (!request.url.includes('usm-administration/rest/authenticate')) {
      const TOKEN = localStorage.getItem('token');
      console.log('request token',  TOKEN);
      authReq = request.clone({ setHeaders: { Authorization: TOKEN } });
    }
    return next.handle(authReq).pipe(
      tap((event: HttpEvent<any>) => {
          console.log(event);
          if (event instanceof HttpResponse) {
            // read header from response
            localStorage.setItem('token', event.headers.get('Authorization'));
          }
        }, (err: any) => {
          if (err instanceof HttpErrorResponse) {
            console.log(err);
            if (err.status === 401 || err.status === 403) {
              // redirect to old signin page
              window.location.href = `${environment.oldBaseURL}/#/login`;
            }
          }
        })
      );
  }
}