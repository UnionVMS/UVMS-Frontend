import { SubscriptionEmailConfiguration } from './subscription-email-configuration.model';
export interface SubscriptionFormOutput {
  alert: boolean;
  emails: Array<any>;
  hasEmail: boolean;
  emailConfiguration: SubscriptionEmailConfiguration;
  messageType: string;
  subscriber: {
      organisationId: number;
      endpointId: number;
      channelId: number;
  };
  logbook: boolean;
  consolidated: boolean;
  vesselIds: Array<any>;
  generateNewReportId: boolean;
  history: number;
  historyUnit: string;
}
