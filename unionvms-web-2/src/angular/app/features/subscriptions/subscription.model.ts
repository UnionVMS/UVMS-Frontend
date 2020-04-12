export interface Subscription {
    id: number;
    messageType: string;
    name: string;
    description: string;
    active: boolean;
    startDate: Date;
    endDate: Date;
    organisationName: string;
    endpointName: string;
    channelName: string;
  }
