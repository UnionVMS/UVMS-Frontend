import { Action } from '@ngrx/store';
import { Organization } from './organization.model';
import { Subscription } from './subscription.model';


export const SET_ORGANIZATIONS = '[SUBSCRIPTIONS] Set Organizations';
export const SET_SUBSCRIPTIONS_LIST = '[SUBSCRIPTIONS] Set Subscriptions List';




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
// create custom type for safety
export type SUBActions = SetOrganizations | SetSubscriptionsList;
