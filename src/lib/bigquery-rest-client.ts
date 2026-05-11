/**
 * BigQuery REST API Client for Cloudflare Workers
 * 
 * This client uses the BigQuery REST API instead of the Node.js SDK,
 * making it compatible with Cloudflare Workers runtime.
 * 
 * References:
 * - https://cloud.google.com/bigquery/docs/reference/rest
 * - https://developers.google.com/identity/protocols/oauth2/service-account
 */

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

interface BigQueryJobConfig {
  query: string;
  useLegacySql?: boolean;
  location?: string;
  maximumBytesBilled?: string;
  timeoutMs?: number;
}

interface BigQueryRow {
  [key: string]: any;
}

/**
 * Generate a JWT for Google Service Account authentication
 */
async function generateJWT(serviceAccount: ServiceAccount): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/bigquery',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Sign with private key
  const signature = await signWithPrivateKey(unsignedToken, serviceAccount.private_key);
  
  return `${unsignedToken}.${signature}`;
}

/**
 * Base64 URL encode (without padding)
 */
function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Sign data with RSA private key using Web Crypto API
 */
async function signWithPrivateKey(data: string, privateKeyPem: string): Promise<string> {
  // Remove PEM header/footer and whitespace
  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  // Decode base64 to binary
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign the data
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    dataBuffer
  );

  // Convert to base64url
  const signatureArray = new Uint8Array(signatureBuffer);
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray));
  return signatureBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Exchange JWT for access token
 */
async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const jwt = await generateJWT(serviceAccount);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

/**
 * BigQuery REST API Client
 */
export class BigQueryRestClient {
  private projectId: string;
  private serviceAccount: ServiceAccount;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(projectId: string, serviceAccount: ServiceAccount) {
    this.projectId = projectId;
    this.serviceAccount = serviceAccount;
  }

  /**
   * Get or refresh access token
   */
  private async getToken(): Promise<string> {
    const now = Date.now() / 1000;
    
    // Refresh token if expired or about to expire (5 min buffer)
    if (!this.accessToken || now >= this.tokenExpiry - 300) {
      this.accessToken = await getAccessToken(this.serviceAccount);
      this.tokenExpiry = now + 3600; // Token valid for 1 hour
    }

    return this.accessToken;
  }

  /**
   * Execute a BigQuery query
   */
  async query(config: BigQueryJobConfig): Promise<BigQueryRow[]> {
    const token = await this.getToken();
    const location = config.location || 'US';

    // Create query job
    const jobResponse = await fetch(
      `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/jobs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configuration: {
            query: {
              query: config.query,
              useLegacySql: config.useLegacySql || false,
              maximumBytesBilled: config.maximumBytesBilled,
            },
          },
          jobReference: {
            projectId: this.projectId,
            location,
          },
        }),
      }
    );

    if (!jobResponse.ok) {
      const error = await jobResponse.text();
      throw new Error(`BigQuery job creation failed: ${error}`);
    }

    const jobData = await jobResponse.json() as any;
    const jobId = jobData.jobReference.jobId;

    // Poll for job completion
    const startTime = Date.now();
    const timeout = config.timeoutMs || 30000;

    while (true) {
      const statusResponse = await fetch(
        `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/jobs/${jobId}?location=${location}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!statusResponse.ok) {
        const error = await statusResponse.text();
        throw new Error(`Failed to check job status: ${error}`);
      }

      const statusData = await statusResponse.json() as any;

      if (statusData.status.state === 'DONE') {
        if (statusData.status.errorResult) {
          throw new Error(`BigQuery job failed: ${statusData.status.errorResult.message}`);
        }

        // Get query results
        return await this.getQueryResults(jobId, location);
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Query timeout exceeded');
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Get query results
   */
  private async getQueryResults(jobId: string, location: string): Promise<BigQueryRow[]> {
    const token = await this.getToken();

    const response = await fetch(
      `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/queries/${jobId}?location=${location}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get query results: ${error}`);
    }

    const data = await response.json() as any;

    // Convert BigQuery response format to simple objects
    if (!data.rows || data.rows.length === 0) {
      return [];
    }

    const schema = data.schema.fields;
    const rows: BigQueryRow[] = [];

    for (const row of data.rows) {
      const obj: BigQueryRow = {};
      for (let i = 0; i < schema.length; i++) {
        const field = schema[i];
        const value = row.f[i].v;
        obj[field.name] = this.convertValue(value, field.type);
      }
      rows.push(obj);
    }

    return rows;
  }

  /**
   * Convert BigQuery value to appropriate JavaScript type
   */
  private convertValue(value: any, type: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'INTEGER':
      case 'INT64':
        return parseInt(value, 10);
      case 'FLOAT':
      case 'FLOAT64':
      case 'NUMERIC':
      case 'BIGNUMERIC':
        return parseFloat(value);
      case 'BOOLEAN':
      case 'BOOL':
        return value === 'true' || value === true;
      case 'TIMESTAMP':
        return new Date(parseFloat(value) * 1000);
      case 'DATE':
      case 'DATETIME':
      case 'TIME':
      case 'STRING':
      default:
        return value;
    }
  }

  /**
   * List tables in a dataset
   */
  async listTables(datasetId: string): Promise<any[]> {
    const token = await this.getToken();

    const response = await fetch(
      `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/datasets/${datasetId}/tables`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list tables: ${error}`);
    }

    const data = await response.json() as any;
    return data.tables || [];
  }

  /**
   * Get table schema
   */
  async getTable(datasetId: string, tableId: string): Promise<any> {
    const token = await this.getToken();

    const response = await fetch(
      `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/datasets/${datasetId}/tables/${tableId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get table: ${error}`);
    }

    return await response.json();
  }
}

/**
 * Create a BigQuery REST client instance
 */
export function createBigQueryClient(
  projectId: string,
  serviceAccountJson: string
): BigQueryRestClient {
  const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
  return new BigQueryRestClient(projectId, serviceAccount);
}
