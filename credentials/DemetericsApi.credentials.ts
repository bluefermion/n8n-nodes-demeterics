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

	documentationUrl = 'https://demeterics.com/docs/api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key Prefix',
			name: 'apiKeyPrefix',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'dmt_XXXXXXXX',
			description: 'The first part of your Demeterics API key (visible prefix)',
		},
		{
			displayName: 'API Key Secret',
			name: 'apiKeySecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			placeholder: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			description: 'The secret part of your Demeterics API key',
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
				Authorization: '=Bearer {{$credentials.apiKeyPrefix}}_{{$credentials.apiKeySecret}}',
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
