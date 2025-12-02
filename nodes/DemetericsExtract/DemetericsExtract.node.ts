import type {
  IBinaryData,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

type ExportFormat = 'json' | 'csv' | 'avro';
type TableName = 'interactions' | 'eval_runs' | 'eval_results';

export class DemetericsExtract implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Demeterics Extract',
    name: 'demetericsExtract',
    icon: 'file:demeterics-node.svg',
    group: ['transform'],
    version: 1,
    description: 'Extract interaction data via the Demeterics Export API',
    defaults: {
      name: 'Demeterics Extract',
    },
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Utilities'],
      },
      resources: {
        primaryDocumentation: [
          { url: 'https://demeterics.com/docs/conversion' },
        ],
      },
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'demetericsApi', required: true }],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Export Interactions (Simple)',
            value: 'exportSimple',
            description: 'Create an export and immediately fetch its contents',
            action: 'Export interactions',
          },
          {
            name: 'Create Export Job',
            value: 'create',
            description: 'Create export and return request ID for later streaming',
            action: 'Create export job',
          },
          {
            name: 'Stream Export by Request ID',
            value: 'stream',
            description: 'Fetch data for an existing export request ID',
            action: 'Stream export by request id',
          },
        ],
        default: 'exportSimple',
      },

      // Export parameters (shared by exportSimple & create)
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'JSON', value: 'json' },
          { name: 'CSV', value: 'csv' },
          { name: 'Avro', value: 'avro' },
        ],
        default: 'json',
        description: 'Export format. JSON parses to items; CSV/Avro returned as binary.',
        displayOptions: { show: { operation: ['exportSimple', 'create'] } },
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'Filter start date (inclusive)',
        displayOptions: { show: { operation: ['exportSimple', 'create'] } },
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'Filter end date (inclusive)',
        displayOptions: { show: { operation: ['exportSimple', 'create'] } },
      },
      {
        displayName: 'Tables',
        name: 'tables',
        type: 'multiOptions',
        options: [
          { name: 'interactions', value: 'interactions' },
          { name: 'eval_runs', value: 'eval_runs' },
          { name: 'eval_results', value: 'eval_results' },
        ],
        default: ['interactions'],
        description: 'Tables to export',
        displayOptions: { show: { operation: ['exportSimple', 'create'] } },
      },

      // Stream parameters
      {
        displayName: 'Request ID',
        name: 'requestId',
        type: 'string',
        required: true,
        default: '',
        description: 'Request ID returned by Create Export Job',
        displayOptions: { show: { operation: ['stream'] } },
      },
      {
        displayName: 'Stream Format',
        name: 'streamFormat',
        type: 'options',
        options: [
          { name: 'JSON', value: 'json' },
          { name: 'CSV', value: 'csv' },
        ],
        default: 'json',
        description: 'Format to request when streaming the export',
        displayOptions: { show: { operation: ['stream'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter('operation', i) as 'exportSimple' | 'create' | 'stream';

      const credentials = await this.getCredentials('demetericsApi');
      const baseUrl = ((credentials.baseUrl as string) || 'https://api.demeterics.com').replace(/\/$/, '');

      if (operation === 'create' || operation === 'exportSimple') {
        const format = this.getNodeParameter('format', i, 'json') as ExportFormat;
        const startDate = this.getNodeParameter('startDate', i, '') as string;
        const endDate = this.getNodeParameter('endDate', i, '') as string;
        const tables = this.getNodeParameter('tables', i, ['interactions']) as TableName[];

        const body: Record<string, unknown> = { format, tables };
        if (startDate) body.start_date = startDate;
        if (endDate) body.end_date = endDate;

        const createOptions = {
          method: 'POST',
          uri: `${baseUrl}/api/v1/exports`,
          body,
          json: true,
        } as const;

        const createResp = await this.helpers.requestWithAuthentication.call(this, 'demetericsApi', createOptions);
        const requestId = createResp?.request_id as string | undefined;

        if (operation === 'create') {
          returnData.push({ json: createResp });
          continue;
        }

        // exportSimple: Immediately stream results
        if (!requestId) {
          throw new Error('Export request did not return a request_id');
        }

        const streamUrl = `${baseUrl}/api/v1/exports/${requestId}/stream`;

        if (format === 'json') {
          // Try to parse JSON, fallback to NDJSON or raw text
          const responseText = await this.helpers.requestWithAuthentication.call(this, 'demetericsApi', {
            method: 'GET',
            uri: streamUrl,
            json: false,
          });

          let parsed: unknown;
          try {
            parsed = JSON.parse(responseText);
            if (Array.isArray(parsed)) {
              for (const row of parsed) returnData.push({ json: row as any });
            } else if (parsed && typeof parsed === 'object') {
              // Sometimes APIs wrap in an object
              returnData.push({ json: parsed as any });
            } else {
              returnData.push({ json: { raw: responseText } });
            }
          } catch {
            // Attempt NDJSON: one JSON object per line
            const lines = String(responseText)
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean);
            if (lines.length > 0) {
              for (const line of lines) {
                try {
                  const obj = JSON.parse(line);
                  returnData.push({ json: obj as any });
                } catch {
                  returnData.push({ json: { raw: line } });
                }
              }
            } else {
              returnData.push({ json: { raw: responseText } });
            }
          }
        } else {
          // CSV or Avro: return as binary file for downstream handling
          const responseBody = (await this.helpers.requestWithAuthentication.call(this, 'demetericsApi', {
            method: 'GET',
            uri: streamUrl,
            json: false,
          })) as string | Buffer;

          const dataBuffer = Buffer.isBuffer(responseBody) ? responseBody : Buffer.from(responseBody);
          const fileExt = format === 'csv' ? 'csv' : 'avro';
          const mime = format === 'csv' ? 'text/csv' : 'application/avro';
          const binaryData = (await this.helpers.prepareBinaryData(dataBuffer, `export.${fileExt}`)) as IBinaryData;
          binaryData.mimeType = mime;

          returnData.push({ json: {}, binary: { file: binaryData } });
        }
      } else if (operation === 'stream') {
        const requestId = this.getNodeParameter('requestId', i) as string;
        const streamFormat = this.getNodeParameter('streamFormat', i, 'json') as 'json' | 'csv';
        const streamUrl = `${baseUrl}/api/v1/exports/${requestId}/stream`;

        if (streamFormat === 'json') {
          const responseText = await this.helpers.requestWithAuthentication.call(this, 'demetericsApi', {
            method: 'GET',
            uri: streamUrl,
            json: false,
          });

          try {
            const parsed = JSON.parse(responseText);
            if (Array.isArray(parsed)) {
              for (const row of parsed) returnData.push({ json: row as any });
            } else {
              returnData.push({ json: parsed as any });
            }
          } catch {
            const lines = String(responseText)
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean);
            if (lines.length > 0) {
              for (const line of lines) {
                try {
                  const obj = JSON.parse(line);
                  returnData.push({ json: obj as any });
                } catch {
                  returnData.push({ json: { raw: line } });
                }
              }
            } else {
              returnData.push({ json: { raw: responseText } });
            }
          }
        } else {
          const responseBody = (await this.helpers.requestWithAuthentication.call(this, 'demetericsApi', {
            method: 'GET',
            uri: streamUrl,
            json: false,
          })) as string | Buffer;

          const dataBuffer = Buffer.isBuffer(responseBody) ? responseBody : Buffer.from(responseBody);
          const binaryData = (await this.helpers.prepareBinaryData(dataBuffer, `export.csv`)) as IBinaryData;
          binaryData.mimeType = 'text/csv';
          returnData.push({ json: {}, binary: { file: binaryData } });
        }
      }
    }

    return [returnData];
  }
}
