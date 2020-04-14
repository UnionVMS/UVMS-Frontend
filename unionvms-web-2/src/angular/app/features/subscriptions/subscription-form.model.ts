import { SubscriptionFormOutput } from './subscription-form-output.model';
import { SubscriptionFormExecution } from './subscription-form-execution.model';

export interface SubscriptionFormModel {
    name: string;
    accessibility: string;
    description: string;
    active: boolean;
    output: SubscriptionFormOutput;
    execution: SubscriptionFormExecution;
    startDate: string;
    endDate: string;
}
