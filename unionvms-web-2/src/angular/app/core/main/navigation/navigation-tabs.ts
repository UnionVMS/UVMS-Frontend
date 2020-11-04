import { environment } from '../../../../environments/environment';

export const NAVIGATION_TABS = [
  {
    id: 1,
    name: 'Today',
    href: `${environment.oldBaseURL}/#/today`,
    // permissions: [300001]
  },
  {
    id: 2,
    name: 'Reports',
    href: `${environment.oldBaseURL}/#/reporting`,
    // permissions: [300001]
  },
  {
    id: 3,
    name: 'Area management',
    href: `${environment.oldBaseURL}/#/areas`,
    // permissions: [100041]
  },
  {
    id: 4,
    name: 'Subscriptions',
    route: '/subscriptions',
    // permissions: [300001]
  },
  {
    id: 5,
    name: 'Activity',
    href: `${environment.oldBaseURL}/#/activity`,
    // permissions: [279]
  },
  {
    id: 6,
    name: 'Positions',
    href: `${environment.oldBaseURL}/#/movement`,
    // permissions: [300001]
  },
  {
    id: 7,
    name: 'Sales',
    href: `${environment.oldBaseURL}/#/sales`,
    // permissions: [300001]
  },
  {
    id: 8,
    name: 'Exchange',
    href: `${environment.oldBaseURL}/#/exchange`,
    // permissions: [300001]
  },
  {
    id: 9,
    name: 'Polling',
    href: `${environment.oldBaseURL}/#/polling/logs`,
    // permissions: [100034]
  },
  {
    id: 11,
    name: 'Assets',
    href: `${environment.oldBaseURL}/#/assets`,
    // permissions: [300001]
  },
  {
    id: 12,
    name: 'Alerts',
    href: `${environment.oldBaseURL}/#/alerts/holdingtable`,
    // permissions: [300001]
  },
  {
    id: 13,
    name: 'User',
    href: `${environment.oldBaseURL}/#/usm/users`,
    // permissions: [300001]
  },
  {
    id: 14,
    name: 'Admin',
    href: `${environment.oldBaseURL}/#/admin/auditlog`,
    // permissions: [300001]
  }
];
