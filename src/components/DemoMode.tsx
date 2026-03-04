import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface DemoModeProps {
  onUseDemoData: () => void;
  onUseRealConnection: () => void;
}

export function DemoMode({ onUseDemoData, onUseRealConnection }: DemoModeProps) {
  const sampleServiceAccount = {
    type: "service_account",
    project_id: "my-bigquery-project",
    private_key_id: "key123...",
    private_key: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
    client_email: "bigquery-reader@my-project.iam.gserviceaccount.com",
    client_id: "123456789",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/..."
  };

  const sampleQuery = `SELECT 
  COUNT(DISTINCT user_id) as value,
  DATE(timestamp) as date
FROM \`project.dataset.events\`
WHERE DATE(timestamp) = CURRENT_DATE()
GROUP BY date`;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to BigQuery Dashboard</CardTitle>
          <CardDescription>
            Connect your BigQuery data warehouse to create real-time dashboards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              This dashboard uses in-memory caching to minimize BigQuery costs. 
              Data is cached for 5 minutes by default.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">🚀 Demo Mode</CardTitle>
                <CardDescription>
                  Explore with sample data (no BigQuery required)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onUseDemoData} className="w-full">
                  Try Demo Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">🔗 Real Connection</CardTitle>
                <CardDescription>
                  Connect to your BigQuery project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onUseRealConnection} variant="outline" className="w-full">
                  Configure BigQuery
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-lg">📚 Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>1. Service Account Setup</strong>
                <p className="text-muted-foreground">
                  Create a service account with BigQuery Data Viewer and Job User roles
                </p>
              </div>
              <div>
                <strong>2. Example Service Account JSON</strong>
                <pre className="bg-background p-2 rounded mt-1 overflow-x-auto text-xs">
                  {JSON.stringify(sampleServiceAccount, null, 2)}
                </pre>
              </div>
              <div>
                <strong>3. Example Query</strong>
                <pre className="bg-background p-2 rounded mt-1 overflow-x-auto text-xs">
                  {sampleQuery}
                </pre>
              </div>
              <div>
                <strong>4. Features</strong>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Automatic caching (5 min TTL)</li>
                  <li>Multiple metric support</li>
                  <li>Real-time refresh capability</li>
                  <li>Query result preview</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
