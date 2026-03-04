import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function SecurityNote() {
  return (
    <Card className="border-orange-500/50 bg-orange-500/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🔒 Security Notice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <AlertDescription>
            <strong>Your credentials are handled securely:</strong>
          </AlertDescription>
        </Alert>
        
        <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
          <li>Service account JSON is sent directly to BigQuery API</li>
          <li>Credentials are NOT stored on our servers</li>
          <li>All queries run server-side in a secure environment</li>
          <li>Only query results are cached (not credentials)</li>
        </ul>

        <Alert>
          <AlertDescription>
            <strong>Best Practices:</strong>
          </AlertDescription>
        </Alert>
        
        <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
          <li>Use service accounts with minimal required permissions</li>
          <li>Enable BigQuery Data Viewer + Job User roles only</li>
          <li>Rotate service account keys regularly (every 90 days)</li>
          <li>Monitor BigQuery usage in Google Cloud Console</li>
          <li>Never commit credentials to version control</li>
        </ul>
      </CardContent>
    </Card>
  );
}
