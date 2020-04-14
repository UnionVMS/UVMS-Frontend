export interface SubscriptionFormOutput {
    messageType: string;
    emails: [];
    alert: boolean;
    subscriber: {
        organizationId: number;
        endpointId: number;
        channelId: number;
    };
    logbook: boolean;
    consolidated: boolean;
    vesselIds: [];
    generateNewReportId: boolean;
    history: boolean;
}