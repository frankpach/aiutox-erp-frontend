/**
 * API services for notification channel configuration endpoints
 */

import apiClient from "./client";
import type { StandardResponse } from "./types/common.types";

export interface SMTPConfigRequest {
  enabled: boolean;
  host: string;
  port: number;
  user: string;
  password: string;
  use_tls: boolean;
  from_email: string;
  from_name?: string | null;
}

export interface SMTPConfigResponse {
  enabled: boolean;
  host: string;
  port: number;
  user: string;
  password: string | null;
  use_tls: boolean;
  from_email: string;
  from_name: string | null;
}

export interface SMSConfigRequest {
  enabled: boolean;
  provider: string;
  account_sid?: string | null;
  auth_token?: string | null;
  from_number?: string | null;
}

export interface SMSConfigResponse {
  enabled: boolean;
  provider: string;
  account_sid: string | null;
  auth_token: string | null;
  from_number: string | null;
}

export interface WebhookConfigRequest {
  enabled: boolean;
  url: string;
  secret?: string | null;
  timeout: number;
}

export interface WebhookConfigResponse {
  enabled: boolean;
  url: string;
  secret: string | null;
  timeout: number;
}

export interface NotificationChannelsResponse {
  smtp: SMTPConfigResponse;
  sms: SMSConfigResponse;
  webhook: WebhookConfigResponse;
}

/**
 * Get notification channels configuration
 * GET /api/v1/config/notifications/channels
 */
export async function getNotificationChannels(): Promise<
  StandardResponse<NotificationChannelsResponse>
> {
  const response = await apiClient.get<StandardResponse<NotificationChannelsResponse>>(
    "/config/notifications/channels"
  );
  return response.data;
}

/**
 * Update SMTP channel configuration
 * PUT /api/v1/config/notifications/channels/smtp
 */
export async function updateSMTPConfig(
  config: SMTPConfigRequest
): Promise<StandardResponse<SMTPConfigResponse>> {
  const response = await apiClient.put<StandardResponse<SMTPConfigResponse>>(
    "/config/notifications/channels/smtp",
    config
  );
  return response.data;
}

/**
 * Update SMS channel configuration
 * PUT /api/v1/config/notifications/channels/sms
 */
export async function updateSMSConfig(
  config: SMSConfigRequest
): Promise<StandardResponse<SMSConfigResponse>> {
  const response = await apiClient.put<StandardResponse<SMSConfigResponse>>(
    "/config/notifications/channels/sms",
    config
  );
  return response.data;
}

/**
 * Update webhook channel configuration
 * PUT /api/v1/config/notifications/channels/webhook
 */
export async function updateWebhookConfig(
  config: WebhookConfigRequest
): Promise<StandardResponse<WebhookConfigResponse>> {
  const response = await apiClient.put<StandardResponse<WebhookConfigResponse>>(
    "/config/notifications/channels/webhook",
    config
  );
  return response.data;
}

/**
 * Test SMTP connection
 * POST /api/v1/config/notifications/channels/smtp/test
 */
export async function testSMTPConnection(): Promise<StandardResponse<{ success: boolean; message: string }>> {
  const response = await apiClient.post<StandardResponse<{ success: boolean; message: string }>>(
    "/config/notifications/channels/smtp/test"
  );
  return response.data;
}

/**
 * Test webhook connection
 * POST /api/v1/config/notifications/channels/webhook/test
 */
export async function testWebhookConnection(): Promise<StandardResponse<{ success: boolean; message: string }>> {
  const response = await apiClient.post<StandardResponse<{ success: boolean; message: string }>>(
    "/config/notifications/channels/webhook/test"
  );
  return response.data;
}

