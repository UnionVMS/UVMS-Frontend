import {
  CLEAR_SUBSCRIPTION_FORM,
  CLOSE_TIMED_ALERT,
  OPEN_TIMED_ALERT,
  SET_ORGANISATIONS,
  SET_SUBSCRIPTIONS_LIST,
  SUBActions,
  TOGGLE_SUBSCRIPTION_FORM_AREAS
} from './subscriptions.actions';
import {Organisation} from './organisation.model';
import {Subscription} from './subscription.model';

export interface StatusAction {
  status: boolean;
}

export interface State {
  organisations: Organisation[];
  subscriptionsList: Subscription[];
  clearSubscriptionForm: StatusAction;
  toggleSubscriptionAreasSection: StatusAction;
  closeTimedAlert: boolean;
}



const initialState: State = {
  organisations: [],
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
    case SET_ORGANISATIONS:
      return {
        ...state,
        organisations: action.payload
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


export const getOrganisations = (state: State) => state.organisations;
export const getClearSubscriptionForm = (state: State) => state.clearSubscriptionForm;
export const getToggleSubscriptionAreasSection = (state: State) => state.toggleSubscriptionAreasSection;
export const closeTimedAlert = (state: State) => state.closeTimedAlert;
export const openTimedAlert = (state: State) => state.closeTimedAlert;
