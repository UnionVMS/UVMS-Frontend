import {CommunicationChannel } from './communication-channel.model';

export interface EndPoint {
  name: string;
  description: string;
  status: string;
  email: string;
  endpointId: number;
  channelList: CommunicationChannel[];
  organizationName: string;
  persons: [];
  uri: string;
}
