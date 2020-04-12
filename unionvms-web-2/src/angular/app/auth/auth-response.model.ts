export interface AuthResponse {
  ip: string;
  jwtoken: string;
  sessionId: string;
  statusCode: number;
  userMap: any;
  errorDescription: string;
  authenticated: boolean;
  username?: string;
  permissions: number[];
}
