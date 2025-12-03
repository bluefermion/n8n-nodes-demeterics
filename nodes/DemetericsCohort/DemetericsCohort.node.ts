import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

// Note: class name must match file base name for n8n custom loader
export class DemetericsCohort implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Demeterics Conversion',
    name: 'demetericsConversion',
    icon: { light: 'file:demeterics-node-light.svg', dark: 'file:demeterics-node-dark.svg' },
    group: ['transform'],
    version: 1,
    description: 'Submit and retrieve conversion outcomes linked to a cohort_id',
    defaults: {
      name: 'Demeterics Conversion',
    },
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Utilities'],
      },
      resources: {
        primaryDocumentation: [
          {
            url: 'https://demeterics.com/docs/conversion',
          },
        ],
      },
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'demetericsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Submit Outcome',
            value: 'submit',
            description: 'Submit or update conversion/metric outcome for a cohort',
            action: 'Submit cohort outcome',
          },
          {
            name: 'Get Outcome',
            value: 'get',
            description: 'Retrieve conversion information for a cohort',
            action: 'Get cohort outcome',
          },
        ],
        default: 'submit',
      },

      // Common: cohort_id
      {
        displayName: 'Cohort ID',
        name: 'cohortId',
        type: 'string',
        required: true,
        default: '',
        description:
          'Identifier used to tag LLM interactions (must match the cohort used in prompts)',
      },

      // Submit fields
      {
        displayName: 'Outcome',
        name: 'outcome',
        type: 'number',
        default: 0,
        required: false,
        description: 'Primary metric (e.g., views, conversion rate, CSAT score)',
        displayOptions: { show: { operation: ['submit'] } },
      },
      {
        displayName: 'Outcome V2',
        name: 'outcomeV2',
        type: 'number',
        default: 0,
        required: false,
        description: 'Secondary metric (e.g., likes, revenue per view, time saved)',
        displayOptions: { show: { operation: ['submit'] } },
      },
      {
        displayName: 'Label',
        name: 'label',
        type: 'string',
        default: '',
        required: false,
        description: 'Human-readable label (e.g., "7d engagement", "email campaign performance")',
        displayOptions: { show: { operation: ['submit'] } },
      },
      {
        displayName: 'Event Date',
        name: 'eventDate',
        type: 'string',
        default: '',
        required: false,
        placeholder: 'YYYY-MM-DD',
        description:
          'Date of the outcome (YYYY-MM-DD). Upserts on cohort_id + event_date when provided.',
        displayOptions: { show: { operation: ['submit'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter('operation', i) as 'submit' | 'get';
      const cohortId = this.getNodeParameter('cohortId', i) as string;

      // Read base URL from credentials to align with testing and self-hosting
      const credentials = await this.getCredentials('demetericsApi');
      const baseUrl = ((credentials.baseUrl as string) || 'https://api.demeterics.com').replace(/\/$/, '');

      if (operation === 'submit') {
        const outcome = this.getNodeParameter('outcome', i, undefined) as number | undefined;
        const outcomeV2 = this.getNodeParameter('outcomeV2', i, undefined) as number | undefined;
        const label = this.getNodeParameter('label', i, undefined) as string | undefined;
        const eventDate = this.getNodeParameter('eventDate', i, undefined) as string | undefined;

        const body: Record<string, unknown> = { cohort_id: cohortId };
        if (typeof outcome === 'number' && !Number.isNaN(outcome)) body.outcome = outcome;
        if (typeof outcomeV2 === 'number' && !Number.isNaN(outcomeV2)) body.outcome_v2 = outcomeV2;
        if (label) body.label = label;
        if (eventDate) body.event_date = eventDate;

        const options = {
          method: 'POST',
          url: `${baseUrl}/api/v1/cohort/outcome`,
          body,
          json: true,
        } as const;

        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'demetericsApi',
          options,
        );

        returnData.push({ json: response });
      } else if (operation === 'get') {
        const options = {
          method: 'GET',
          url: `${baseUrl}/api/v1/cohort/outcome`,
          qs: { cohort_id: cohortId },
          json: true,
        } as const;

        const response = await this.helpers.httpRequestWithAuthentication.call(
          this,
          'demetericsApi',
          options,
        );

        returnData.push({ json: response });
      }
    }

    return [returnData];
  }
}
