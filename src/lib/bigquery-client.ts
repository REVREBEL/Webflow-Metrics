import { BigQuery } from '@google-cloud/bigquery';

export interface BigQueryConfig {
  credentials: any; // Service account JSON
  projectId: string;
  location?: string;
}

export interface QueryConfig {
  query: string;
  tableName: string;
  metricName: string;
}

export interface QueryParameter {
  name: string;
  type: 'STRING' | 'INT64' | 'FLOAT64' | 'DATE' | 'TIMESTAMP';
  value: any;
}

export class BigQueryClient {
  private client: BigQuery | null = null;
  private location: string;

  constructor(private config: BigQueryConfig) {
    this.location = config.location || 'US';
    
    if (config.credentials && config.projectId) {
      this.client = new BigQuery({
        projectId: config.projectId,
        credentials: config.credentials,
      });
    }
  }

  async executeQuery(query: string, params?: QueryParameter[]): Promise<any[]> {
    if (!this.client) {
      throw new Error('BigQuery client not initialized');
    }

    try {
      const options: any = {
        query,
        location: this.location,
      };

      // Add query parameters if provided
      if (params && params.length > 0) {
        console.log('Setting up BigQuery parameters:', params);
        
        // BigQuery SDK expects this exact format for named parameters
        options.params = params.reduce((acc, param) => {
          acc[param.name] = param.value;
          return acc;
        }, {} as Record<string, any>);
        
        console.log('Parameters object:', options.params);
      }

      console.log('Executing BigQuery query with options:', {
        query: query.substring(0, 200),
        params: options.params,
        location: options.location
      });

      const [rows] = await this.client.query(options);
      return rows;
    } catch (error: any) {
      console.error('BigQuery query error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        errors: error.errors
      });
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const query = 'SELECT 1 as test';
      await this.executeQuery(query);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export function parseServiceAccountJson(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}
