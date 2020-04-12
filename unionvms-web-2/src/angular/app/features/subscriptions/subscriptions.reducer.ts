import { SUBActions, SET_ORGANIZATIONS,  SET_SUBSCRIPTIONS_LIST } from './subscriptions.actions';
import { Organization } from './organization.model';
import { Subscription } from './subscription.model';

export interface State {
  organizations: Organization[];
  subscriptionsList: Subscription[];
}

const initialState: State = {
  organizations: [],
  subscriptionsList: []
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
    default: {
      return state;
    }

  }

}


export const getOrganizations = (state: State) => state.organizations;
