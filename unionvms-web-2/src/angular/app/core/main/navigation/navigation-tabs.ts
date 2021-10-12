import { environment } from '../../../../environments/environment';

export const NAVIGATION_TABS = [
  {
    id: 1,
    name: 'Today',
    href: `${environment.oldBaseURL}/#/today`
  },
  {
    id: 2,
    name: 'Reports',
    href: `${environment.oldBaseURL}/#/reporting`,
    permissions: [21] //LIST_REPORTS
  },
  {
    id: 3,
    name: 'Area management',
    href: `${environment.oldBaseURL}/#/areas`,
    permissions: [100036] //VIEW_AREA_MANAGEMENT_UI
  },
  {
    id: 4,
    name: 'Subscriptions',
    route: '/subscriptions',
    permissions: [300000] //VIEW_SUBSCRIPTION
  },
  {
    id: 5,
    name: 'Activity',
    href: `${environment.oldBaseURL}/#/activity`,
    permissions: [100026] //ACTIVITY_ALLOWED
  },
  {
    id: 6,
    name: 'Positions'
  },
  {
    id: 7,
    name: 'Exchange',
    href: `${environment.oldBaseURL}/#/exchange`,
    permissions: [249] //viewExchange
  },
  {
    id: 8,
    name: 'Assets',
    href: `${environment.oldBaseURL}/#/assets`,
    permissions: [292] //viewVesselsAndMobileTerminals
  },
  {
    id: 9,
    name: 'Alerts'
  },
  {
    id: 10,
    name: 'User'
  },
  {
    id: 11,
    name: 'Admin'
  }
];
