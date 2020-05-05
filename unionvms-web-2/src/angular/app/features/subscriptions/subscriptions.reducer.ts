import { SUBActions, SET_ORGANIZATIONS, SET_SUBSCRIPTIONS_LIST, CLEAR_SUBSCRIPTION_FORM, ClearSubscriptionForm } from './subscriptions.actions';
import { Organization } from './organization.model';
import { Subscription } from './subscription.model';

export interface State {
  organizations: Organization[];
  subscriptionsList: Subscription[];
  clearSubscriptionForm: boolean;
}

const initialState: State = {
  organizations: [],
  subscriptionsList: [],
  clearSubscriptionForm: false
};

export function subReducer(state = initialState, action: SUBActions ) {
  switch (action.type) {
    case SET_ORGANIZATIONS:
      return {
        ...state,
        organizations: action.payload
      };
    case SET_SUBSCRIPTIONS_LIST:
      return {
        ...state,
        subscriptionsList: action.payload
      };
    case CLEAR_SUBSCRIPTION_FORM:
      return {
      ...state,
      clearSubscriptionForm: true
    };
    default: {
      return state;
    }

  }

}


export const getOrganizations = (state: State) => state.organizations;
export const clearSubscriptionForm = (state: State) => state.clearSubscriptionForm;
