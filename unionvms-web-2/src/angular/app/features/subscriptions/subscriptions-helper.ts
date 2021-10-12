export const subscriptionFormInitialValues = {
  name: '',
  description: '',
  active: false,
  output: {
    messageType: 'NONE',
    emails: [],
    hasEmail: false,
    emailConfiguration: {
      body: '',
      isPdf: false,
      zipAttachments: false,
      password: '',
      passwordIsPlaceholder: false,
      isXml: false
    },
    alert: false,
    subscriber: {
      organisationId: null,
      endpointId: null,
      channelId: null
    },
    logbook: false,
    consolidated: false,
    vesselIds: [true, true, true, true, true],
    generateNewReportId: false,
    history: 1,
    historyUnit: 'DAYS'
  },
  execution: {
    triggerType: 'SCHEDULER',
    frequency: 0,
    frequencyUnit: 'DAYS',
    immediate: false,
    timeExpression: '06:00'
  },
  startDate: null,
  endDate: null
};

export const manualSubscriptionsInitialFormValues = {
  output: {
    messageType: 'FA_QUERY',
    consolidated: true,
    vesselIds: ['CFR'],
    queryStartDate: null,
    queryEndDate: null,
    history: null,
    historyUnit: null
  }
};
