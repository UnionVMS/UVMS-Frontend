export interface ResponseDto<T> {
  data: T;
  code: number;
  msg?: string;
}

export interface ChannelDto {
  channelId: number;
  dataflow: string;
  service: string;
}

export interface EndPointDto {
  endPointId: number;
  name: string;
  uri: string;
  channel: ChannelDto[];
}

export interface OrganisationDto {
  organisationId: number;
  name: string;
  isoa3code: string;
  endPointList: EndPointDto[];
}

export interface SubscriptionSubscriberDto {
  organisationId: number;
  endpointId: number;
  channelId: number;
}
