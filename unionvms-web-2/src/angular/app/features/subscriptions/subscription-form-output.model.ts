import { SubscriptionEmailConfiguration } from './subscription-email-configuration.model';
export interface SubscriptionFormOutput {
  alert: boolean;
  emails: [];
  hasEmail: boolean;
  emailConfiguration: SubscriptionEmailConfiguration;
  messageType: string;
  subscriber: {
      organizationId: number;
      endpointId: number;
      channelId: number;
  };
  logbook: boolean;
  consolidated: boolean;
  vesselIds: [];
  generateNewReportId: boolean;
  history: number;
  historyUnit: string;

}
