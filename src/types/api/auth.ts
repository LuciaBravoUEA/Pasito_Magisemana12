export interface RoleSummary {
  id: string;
  code: string;
  name: string;
}

export interface PermissionSummary {
  id: string;
  code: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  roles: RoleSummary[];
  permissions: PermissionSummary[];
}

// Respuesta del login móvil — ver feature 003.
export interface MobileTokenResponse {
  sessionToken: string;
  expiresAt: string;
}

export interface MobileRegistrationRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}
