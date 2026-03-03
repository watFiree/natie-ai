import { integrationConfig, IntegrationType } from './consts';

export function isIntegrationType(value: unknown): value is IntegrationType {
  return value === 'gmail' || value === 'calendar';
}

export function isOAuthState(
  value: unknown
): value is { nonce: string; integration: IntegrationType } {
  if (typeof value !== 'object' || value === null) return false;
  if (!('nonce' in value) || !('integration' in value)) return false;
  return (
    typeof value.nonce === 'string' && isIntegrationType(value.integration)
  );
}

export function buildOAuthRoute(integration: IntegrationType) {
  return {
    state: (nonce: string) => JSON.stringify({ nonce, integration }),
    scopes: integrationConfig[integration].scopes,
  };
}

export function redirectUrls(
  integration: IntegrationType,
  frontendUrl: string
) {
  const config = integrationConfig[integration];
  return {
    success: `${frontendUrl}${config.frontendPath}?${config.successParam}`,
    failed: `${frontendUrl}${config.frontendPath}?${config.failedParam}`,
    alreadyRegistered: `${frontendUrl}${config.frontendPath}?${config.alreadyRegisteredParam}`,
  };
}
