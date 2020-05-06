import { SUBActions, SET_ORGANIZATIONS, SET_SUBSCRIPTIONS_LIST, CLEAR_SUBSCRIPTION_FORM } from './subscriptions.actions';
import { Organization } from './organization.model';
import { Subscription } from './subscription.model';

export interface ClearAction {
  status: boolean;
}

export interface State {
  organizations: Organization[];
  subscriptionsList: Subscription[];
  clearSubscriptionForm: ClearAction;
}



const initialState: State = {
  organizations: [],
  subscriptionsList: [],
  clearSubscriptionForm: {
    status: false
  }
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
      clearSubscriptionForm: action.payload
    };
    default: {
      return state;
    }

  }

}


export const getOrganizations = (state: State) => state.organizations;
export const getClearSubscriptionForm = (state: State) => state.clearSubscriptionForm;
