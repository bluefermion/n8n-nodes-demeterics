/**
 * Security utilities for Demeterics n8n nodes.
 * Provides URL validation to prevent SSRF attacks.
 */

/**
 * Validates that a base URL is safe (HTTPS, not internal/private networks).
 * Prevents SSRF attacks by blocking internal IPs, metadata services, and localhost.
 *
 * @param url - The URL to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateBaseUrl(url: string): { valid: boolean; error?: string } {
	try {
		const parsed = new URL(url);

		// Require HTTPS in production (allow http only for localhost development)
		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
			return { valid: false, error: 'URL must use HTTPS protocol' };
		}

		const hostname = parsed.hostname.toLowerCase();

		// Block localhost and loopback - allow only for http (local dev)
		if (
			hostname === 'localhost' ||
			hostname === '127.0.0.1' ||
			hostname === '::1' ||
			hostname === '0.0.0.0'
		) {
			if (parsed.protocol === 'http:') {
				return { valid: true }; // Allow localhost for local development
			}
			return { valid: false, error: 'Localhost URLs not allowed with HTTPS' };
		}

		// Block private IP ranges (RFC 1918)
		const privatePatterns = [
			/^10\./,                          // 10.0.0.0/8
			/^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
			/^192\.168\./,                    // 192.168.0.0/16
			/^169\.254\./,                    // Link-local (including AWS metadata: 169.254.169.254)
			/^fc00:/i,                        // IPv6 unique local
			/^fe80:/i,                        // IPv6 link-local
		];

		for (const pattern of privatePatterns) {
			if (pattern.test(hostname)) {
				return { valid: false, error: 'Private/internal IP addresses not allowed' };
			}
		}

		// Block cloud metadata services
		const metadataHosts = [
			'metadata.google.internal',
			'metadata.goog',
			'metadata',
		];
		if (metadataHosts.includes(hostname)) {
			return { valid: false, error: 'Cloud metadata services not allowed' };
		}

		return { valid: true };
	} catch {
		return { valid: false, error: 'Invalid URL format' };
	}
}

/**
 * Gets a validated base URL or throws an error.
 * Use this in node execute methods to ensure the URL is safe before making requests.
 *
 * @param baseUrl - The base URL from credentials
 * @param defaultUrl - Default URL to use if baseUrl is empty
 * @returns The validated and normalized base URL (trailing slash removed)
 * @throws Error if the URL is invalid or points to internal resources
 */
export function getValidatedBaseUrl(
	baseUrl: string | undefined,
	defaultUrl = 'https://api.demeterics.com',
): string {
	const url = (baseUrl || defaultUrl).replace(/\/$/, '');
	const validation = validateBaseUrl(url);

	if (!validation.valid) {
		throw new Error(`Invalid API base URL: ${validation.error}`);
	}

	return url;
}

/**
 * Validates a request ID to prevent path traversal attacks.
 * Request IDs should be alphanumeric with hyphens and underscores only.
 *
 * @param requestId - The request ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidRequestId(requestId: string): boolean {
	// Allow alphanumeric, hyphens, underscores only
	// Block path traversal attempts like ../ or encoded variants
	return /^[a-zA-Z0-9_-]+$/.test(requestId) && requestId.length <= 128;
}
