export interface Subscription {
  id: number;
  messageType: string;
  triggerType: string;
  name: string;
  description: string;
  active: boolean;
  startDate: Date;
  endDate: Date;
  organisationName: string;
  endpointName: string;
  channelName: string;
}

export interface SubscriptionListResponseDto {
  currentPage: number;
  totalNumberOfPages: number;
  totalCount: number;
  subscriptionList: Subscription[];
}
