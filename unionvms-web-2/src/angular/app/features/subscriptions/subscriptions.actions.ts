import { Action } from '@ngrx/store';
import { Organisation } from './organisation.model';
import { Subscription } from './subscription.model';
import { StatusAction } from './subscriptions.reducer';


export const SET_ORGANISATIONS = '[SUBSCRIPTIONS] Set OrganiSations';
export const SET_SUBSCRIPTIONS_LIST = '[SUBSCRIPTIONS] Set Subscriptions List';
export const CLEAR_SUBSCRIPTION_FORM = '[SUBSCRIPTIONS] Clear Subscription Form';
export const TOGGLE_SUBSCRIPTION_FORM_AREAS = '[SUBSCRIPTIONS] Toggle Subscription Form Areas';
export const CLOSE_TIMED_ALERT = '[SUBSCRIPTIONS} Close Timed Alert';
export const OPEN_TIMED_ALERT = '[SUBSCRIPTIONS] Open Timed Alert';




export class SetOrganisations implements Action {
  readonly type = SET_ORGANISATIONS;
  constructor(public payload: Organisation[]) {
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
  constructor(public payload: StatusAction) {
  }
}
export class ToggleSubscriptionAreasSection implements Action {
  readonly type = TOGGLE_SUBSCRIPTION_FORM_AREAS;
  // Explanation on why this is an object https://github.com/ngrx/platform/issues/208
  constructor(public payload: StatusAction) {
  }
}

export class CloseTimedAlert implements Action {
  readonly type = CLOSE_TIMED_ALERT;
}

export class OpenTimedAlert implements Action {
  readonly type = OPEN_TIMED_ALERT;
}

// create custom type for safety
export type SUBActions = SetOrganisations | SetSubscriptionsList | ClearSubscriptionForm
| ToggleSubscriptionAreasSection | CloseTimedAlert | OpenTimedAlert;
