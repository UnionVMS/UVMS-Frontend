import { Action } from '@ngrx/store';
import { Organization } from './organization.model';
import { Subscription } from './subscription.model';
import { ClearAction } from './subscriptions.reducer';


export const SET_ORGANIZATIONS = '[SUBSCRIPTIONS] Set Organizations';
export const SET_SUBSCRIPTIONS_LIST = '[SUBSCRIPTIONS] Set Subscriptions List';
export const CLEAR_SUBSCRIPTION_FORM = '[SUBSCRIPTIONS] Clear Subscription Form';




export class SetOrganizations implements Action {
  readonly type = SET_ORGANIZATIONS;
  constructor(public payload: Organization[]) {
  }
}

export class SetSubscriptionsList implements Action {
  readonly type = SET_SUBSCRIPTIONS_LIST;
  constructor(public payload: Subscription[]) {
  }
}

export class ClearSubscriptionForm implements Action {
  readonly type = CLEAR_SUBSCRIPTION_FORM;
  // Explanation on why this is an object https://github.com/ngrx/platform/issues/208
  constructor(public payload: ClearAction) {
  }
}
// create custom type for safety
export type SUBActions = SetOrganizations | SetSubscriptionsList | ClearSubscriptionForm;
