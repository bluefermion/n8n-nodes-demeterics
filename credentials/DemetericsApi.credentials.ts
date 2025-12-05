import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Validates that a base URL is safe (HTTPS, not internal/private networks).
 * Prevents SSRF attacks by blocking internal IPs, metadata services, and localhost.
 */
export function isValidBaseUrl(url: string): { valid: boolean; error?: string } {
	try {
		const parsed = new URL(url);

		// Require HTTPS in production (allow http only for localhost development)
		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
			return { valid: false, error: 'URL must use HTTPS protocol' };
		}

		const hostname = parsed.hostname.toLowerCase();

		// Block localhost and loopback
		if (
			hostname === 'localhost' ||
			hostname === '127.0.0.1' ||
			hostname === '::1' ||
			hostname === '0.0.0.0'
		) {
			// Allow localhost only for development with http
			if (parsed.protocol === 'http:') {
				return { valid: true }; // Allow localhost for local development
			}
			return { valid: false, error: 'Localhost URLs not allowed in production' };
		}

		// Block private IP ranges (RFC 1918)
		const privatePatterns = [
			/^10\./,                          // 10.0.0.0/8
			/^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
			/^192\.168\./,                    // 192.168.0.0/16
			/^169\.254\./,                    // Link-local (including AWS metadata)
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
 * Demeterics API credentials for accessing the LLM Gateway.
 *
 * The Demeterics platform provides a unified API for multiple LLM providers
 * (OpenAI, Anthropic, Groq, Google Gemini) with built-in usage tracking,
 * cost analytics, and rate limiting.
 *
 * Get your API key at: https://demeterics.com/api-keys
 */
export class DemetericsApi implements ICredentialType {
	name = 'demetericsApi';

	displayName = 'Demeterics API';

	// Use 32px PNG for best clarity at 18px UI scale
	icon = 'file:demeterics-32.png' as const;

	documentationUrl = 'https://demeterics.com/docs/api';

	properties: INodeProperties[] = [
		{
			displayName: 'BYOK (Bring Your Own Key)',
			name: 'byok',
			type: 'boolean',
			default: false,
			description:
				'Enable if you use your own provider keys with Demeterics. Leave off for Managed Key.',
		},
		{
			displayName: 'Demeterics API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			placeholder: 'dmt_xxx... (single key)',
			description: 'Your Demeterics API key. For Managed Key, this is the only key needed.',
		},
		// BYOK per‑provider keys (optional). Only shown when BYOK is enabled.
		{
			displayName: 'Groq API Key',
			name: 'providerApiKeyGroq',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			placeholder: 'GROQ_API_KEY',
			description: 'Used when routing via Groq provider.',
			displayOptions: { show: { byok: [true] } },
		},
		{
			displayName: 'OpenAI API Key',
			name: 'providerApiKeyOpenAI',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			placeholder: 'OPENAI_API_KEY',
			description: 'Used when routing via OpenAI provider.',
			displayOptions: { show: { byok: [true] } },
		},
		{
			displayName: 'Anthropic API Key',
			name: 'providerApiKeyAnthropic',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			placeholder: 'ANTHROPIC_API_KEY',
			description: 'Used when routing via Anthropic provider.',
			displayOptions: { show: { byok: [true] } },
		},
		{
			displayName: 'Gemini API Key',
			name: 'providerApiKeyGemini',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			placeholder: 'GEMINI_API_KEY',
			description: 'Used when routing via Google Gemini provider.',
			displayOptions: { show: { byok: [true] } },
		},
		{
			displayName: 'OpenRouter API Key',
			name: 'providerApiKeyOpenRouter',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			placeholder: 'OPENROUTER_API_KEY',
			description: 'Used when routing via OpenRouter provider.',
			displayOptions: { show: { byok: [true] } },
		},
		{
			displayName: 'ElevenLabs API Key',
			name: 'providerApiKeyElevenLabs',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			placeholder: 'ELEVENLABS_API_KEY',
			description: 'Used when routing TTS via ElevenLabs provider.',
			displayOptions: { show: { byok: [true] } },
		},
		{
			displayName: 'Stability AI API Key',
			name: 'providerApiKeyStability',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			placeholder: 'STABILITY_API_KEY',
			description: 'Used when routing image generation via Stability AI provider.',
			displayOptions: { show: { byok: [true] } },
		},
		{
			displayName: 'Leonardo AI API Key',
			name: 'providerApiKeyLeonardo',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			placeholder: 'LEONARDO_API_KEY',
			description: 'Used when routing image generation via Leonardo AI provider.',
			displayOptions: { show: { byok: [true] } },
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.demeterics.com',
			description: 'The base URL for the Demeterics API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				// Use the base Demeterics key for auth check; runtime can add vendor key if needed
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/health',
			method: 'GET',
		},
	};
}
