/**
 * API services for authentication endpoints
 * Handles forgot password, reset password, and email verification
 */

import apiClient from "./client";
import type { StandardResponse } from "../../features/views/types/savedFilter.types";

/**
 * Request to send password recovery email
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Response from forgot password endpoint
 */
export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Request to reset password
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Response from reset password endpoint
 */
export interface ResetPasswordResponse {
  message: string;
}

/**
 * Request to verify email
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Response from verify email endpoint
 */
export interface VerifyEmailResponse {
  message: string;
  verified: boolean;
}

/**
 * Send password recovery email
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPassword(
  email: string
): Promise<StandardResponse<ForgotPasswordResponse>> {
  const response = await apiClient.post<
    StandardResponse<ForgotPasswordResponse>
  >("/auth/forgot-password", { email });
  return response.data;
}

/**
 * Reset password with token
 * POST /api/v1/auth/reset-password
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<StandardResponse<ResetPasswordResponse>> {
  const response = await apiClient.post<
    StandardResponse<ResetPasswordResponse>
  >("/auth/reset-password", { token, password });
  return response.data;
}

/**
 * Verify email with token
 * POST /api/v1/auth/verify-email
 * Note: Endpoint may not exist yet, but structure is prepared
 */
export async function verifyEmail(
  token: string
): Promise<StandardResponse<VerifyEmailResponse>> {
  const response = await apiClient.post<StandardResponse<VerifyEmailResponse>>(
    "/auth/verify-email",
    { token }
  );
  return response.data;
}
