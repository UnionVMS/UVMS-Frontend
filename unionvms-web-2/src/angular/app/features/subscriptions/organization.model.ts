import { EndPoint } from './endpoint.model';
export interface Organization {
  name: string;
  description: string;
  nation: string;
  status: string;
  organisationId: number;
  parent: string;
  endpoints?: EndPoint[];
  email?: any;
  assignedUsers: number;
}
