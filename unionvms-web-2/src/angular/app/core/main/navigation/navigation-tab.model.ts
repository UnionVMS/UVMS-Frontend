export interface NavigationTab {
  id: number;
  name: string;
  route?: string;
  permissions?: number[];
  href?: string;
}
