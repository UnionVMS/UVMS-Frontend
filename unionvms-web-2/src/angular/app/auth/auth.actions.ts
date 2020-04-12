import { Action } from '@ngrx/store';
import { AuthResponse } from './auth-response.model';
import { UserContexts } from './user-contexts.model';

export const AUTHENTICATE = '[AUTH] Authenticate';
export const UNAUTHENTICATE = '[AUTH] Unauthenticate';
export const SET_AUTHENTICATED_USER = '[AUTH] Set authenticated user';
export const SET_AUTHENTICATED_USER_CONTEXTS = '[AUTH] Set authenticated user contexts';

// Create classes to get code autocompletion
export class Authenticate implements Action {
  readonly type = AUTHENTICATE;
}

export class Unauthenticate implements Action {
  readonly type = UNAUTHENTICATE;
}

export class SetAuthenticatedUser implements Action {
  readonly type = SET_AUTHENTICATED_USER;
  constructor(public payload: AuthResponse) {
  }
}

export class SetAuthenticatedUserContexts implements Action {
  readonly type = SET_AUTHENTICATED_USER_CONTEXTS;
  constructor(public payload: UserContexts) {
  }
}
// create custom type for safety
export type AUTHActions = Authenticate | Unauthenticate | SetAuthenticatedUser | SetAuthenticatedUserContexts;
