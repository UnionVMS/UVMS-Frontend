import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { isDevMode } from '@angular/core';

if (environment.production) {
  enableProdMode();
}
initEnv();

function initEnv() {
  let token;
  let sessionId;
  let scopeName;
  let roleName;
   // If we are in development environment we need to get the token and sessionId from the url as
    // local storage is available per domain.
  if (isDevMode()) {
    const locationURL = window.location.href;
    const url = new URL(locationURL);
    token = new URLSearchParams(url.search).get('token');
    sessionId = new URLSearchParams(url.search).get('sessionId');
    scopeName = new URLSearchParams(url.search).get('scopeName');
    roleName = new URLSearchParams(url.search).get('roleName');
    // user refreshes subscriptions page
    if (!token && !sessionId && !scopeName && !roleName) {
      token = localStorage.getItem('token');
      sessionId = localStorage.getItem('sessionId');
      scopeName = localStorage.getItem('scopeName');
      roleName = localStorage.getItem('roleName');
    }
    // Remove token and session id from URL, not visible to user
    window.history.replaceState(null, null, window.location.pathname);
  } else {
    // We are in production environment (old and new app under the same domain) thus we can get values
    token = JSON.parse(localStorage.getItem('ngStorage-token'));
    sessionId = JSON.parse(localStorage.getItem('ngStorage-sessionId'));
    scopeName = JSON.parse(localStorage.getItem('ngStorage-scopeName'));
    roleName = JSON.parse(localStorage.getItem('ngStorage-roleName'));
  }
  localStorage.setItem('token', token);
  localStorage.setItem('sessionId', sessionId);
  localStorage.setItem('scopeName', scopeName);
  localStorage.setItem('roleName', roleName);
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
