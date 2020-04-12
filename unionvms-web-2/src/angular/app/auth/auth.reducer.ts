import { AUTHActions, AUTHENTICATE, UNAUTHENTICATE, SET_AUTHENTICATED_USER, SET_AUTHENTICATED_USER_CONTEXTS } from './auth.actions';
import * as User from './auth-response.model';
import { UserContexts } from './user-contexts.model';
export interface State {
  isAuthenticated: boolean;
  user: User.AuthResponse;
  permissions: number[];
  authenticatedUserContexts: UserContexts;
}

const initialState: State = {
  isAuthenticated: false,
  user: null,
  permissions: [],
  authenticatedUserContexts: null
};

export function authReducer(state = initialState, action: AUTHActions ) {

  switch (action.type) {
    case AUTHENTICATE:
      return {
        ...state,
        isAuthenticated: true
      };
    case UNAUTHENTICATE:
      return {
        ...state,
        isAuthenticated: false
      };
    case SET_AUTHENTICATED_USER:
      return {
        ...state,
        user: action.payload
      };
    case SET_AUTHENTICATED_USER_CONTEXTS:
      return {
        ...state,
        authenticatedUserContexts: action.payload
      };
    default: {
      return state;
    }

  }

}

export const getIsAuthenticated = (state: State) => state.isAuthenticated;
export const getAuthenticatedUser = (state: State) => state.user;
export const getAuthenticatedUserContexts = (state: State) => state.authenticatedUserContexts;
