import { SubscriptionFormOutput } from './subscription-form-output.model';
import { SubscriptionFormExecution } from './subscription-form-execution.model';

export interface SubscriptionFormModel {
  id?: number;
  name: string;
  accessibility?: string;
  description: string;
  active: boolean;
  output: SubscriptionFormOutput;
  execution: SubscriptionFormExecution;
  startDate: string;
  endDate: string;
  areas: Array<any>;
  assets: Array<any>;
  deadline: number;
  deadlineUnit: string;
  stopWhenQuitArea: boolean;
  stopActivities: Array<any>;
}
