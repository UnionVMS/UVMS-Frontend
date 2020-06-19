import { SUBActions, SET_ORGANIZATIONS, SET_SUBSCRIPTIONS_LIST, CLEAR_SUBSCRIPTION_FORM,
          TOGGLE_SUBSCRIPTION_FORM_AREAS, CLOSE_TIMED_ALERT, OPEN_TIMED_ALERT } from './subscriptions.actions';
import { Organization } from './organization.model';
import { Subscription } from './subscription.model';
import { CloseTimedAlert } from './subscriptions.actions';

export interface StatusAction {
  status: boolean;
}

export interface State {
  organizations: Organization[];
  subscriptionsList: Subscription[];
  clearSubscriptionForm: StatusAction;
  toggleSubscriptionAreasSection: StatusAction;
  closeTimedAlert: boolean;
}



const initialState: State = {
  organizations: [],
  subscriptionsList: [],
  clearSubscriptionForm: {
    status: false
  },
  toggleSubscriptionAreasSection: {
    status : true
  },
  closeTimedAlert: false
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
    case TOGGLE_SUBSCRIPTION_FORM_AREAS:
      return {
        ...state,
        toggleSubscriptionAreasSection: action.payload
    };
    case CLOSE_TIMED_ALERT:
      return {
        ...state,
        closeTimedAlert: true
    };
    case OPEN_TIMED_ALERT:
      return {
        ...state,
        closeTimedAlert: false
    };
    default: {
      return state;
    }
  }

}


export const getOrganizations = (state: State) => state.organizations;
export const getClearSubscriptionForm = (state: State) => state.clearSubscriptionForm;
export const getToggleSubscriptionAreasSection = (state: State) => state.toggleSubscriptionAreasSection;
export const closeTimedAlert = (state: State) => state.closeTimedAlert;
export const openTimedAlert = (state: State) => state.closeTimedAlert;
