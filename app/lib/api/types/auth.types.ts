/**
 * Types for authentication and token management
 * 
 * These types align with the backend API contract defined in `rules/auth-rbac.md`
 * and `rules/api-contract.md`.
 */

/**
 * Response from login endpoint
 * POST /api/v1/auth/login
 */
export interface TokenResponse {
  /** Access token (JWT) - expires in 15 minutes */
  access_token: string;
  /** Refresh token (JWT) - expires in 7 days */
  refresh_token: string;
  /** Token type, typically "bearer" */
  token_type: string;
}

/**
 * Response from refresh token endpoint
 * POST /api/v1/auth/refresh
 */
export interface RefreshTokenResponse {
  /** New access token (JWT) - expires in 15 minutes */
  access_token: string;
  /** Token type, typically "bearer" */
  token_type: string;
}

/**
 * Request body for refresh token endpoint
 * POST /api/v1/auth/refresh
 */
export interface RefreshTokenRequest {
  /** Refresh token to use for renewal */
  refresh_token: string;
}
