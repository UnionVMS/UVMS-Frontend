export interface Feature {
  applicationName: string;
  featureName: string;
  featureId: number;
}

export interface Role {
  roleName: string;
  features: Feature[];
}

export interface Dataset {
  applicationName: string;
  name: string;
  category: string;
  discriminator: string;
  description?: any;
}

export interface Scope {
  scopeName: string;
  activeFrom: Date;
  activeTo: Date;
  dataFrom?: any;
  dataTo?: any;
  datasets: Dataset[];
}

export interface Preference {
  applicationName: string;
  optionName: string;
  optionValue: string;
}

export interface Preferences {
  preferences: Preference[];
}

export interface Context {
  role: Role;
  scope: Scope;
  preferences: Preferences;
}

export interface ContextSet {
  contexts: Context[];
}

export interface UserContexts {
  userName: string;
  applicationName?: any;
  contextSet: ContextSet;
}
