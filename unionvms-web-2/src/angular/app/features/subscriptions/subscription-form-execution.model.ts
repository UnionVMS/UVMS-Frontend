export interface SubscriptionFormExecution {
    triggerType: string;
    frequency: number;
    frequencyUnit: string;
    immediate: boolean;
    timeExpression: string;
}
