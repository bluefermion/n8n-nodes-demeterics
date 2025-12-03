import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

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
