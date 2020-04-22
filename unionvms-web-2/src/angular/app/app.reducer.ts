import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAuth from './auth/auth.reducer';
import * as fromSub from './features/subscriptions/subscriptions.reducer';



export interface State {
  auth: fromAuth.State;
  sub: fromSub.State;
}




export const REDUCERS: ActionReducerMap<State> =  {
  auth: fromAuth.authReducer,
  sub: fromSub.subReducer

};

// get quick access to auth slice of state as returned by auth reducer in global app state
export const getAuthState = createFeatureSelector<fromAuth.State>('auth');
// get quick access to a specific property of the state
export const getIsAuthenticated = createSelector(getAuthState, fromAuth.getIsAuthenticated);
export const getAuthenticatedUser = createSelector(getAuthState, fromAuth.getAuthenticatedUser );
export const getAuthenticatedUserContexts = createSelector(getAuthState, fromAuth.getAuthenticatedUserContexts);

export const getSubState = createFeatureSelector<fromSub.State>('sub');
export const getOrganizations = createSelector(getSubState, fromSub.getOrganizations);
