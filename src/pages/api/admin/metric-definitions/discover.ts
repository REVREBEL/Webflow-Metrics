

import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers });
};

/**
 * Discover new metrics from data templates that haven't been defined yet
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers }
      );
    }

    // Get all data templates
    const templatesResult = await db
      .prepare('SELECT id, template_name, output_columns FROM data_templates')
      .all();

    const templates = templatesResult.results as any[];

    // Get all existing metric definitions
    const metricsResult = await db
      .prepare('SELECT metric_name FROM metric_definitions')
      .all();

    const existingMetrics = new Set(
      (metricsResult.results as any[]).map(m => m.metric_name)
    );

    // Find new columns that don't have metric definitions
    const newMetrics: any[] = [];

    for (const template of templates) {
      const columns = JSON.parse(template.output_columns || '[]');
      
      for (const columnName of columns) {
        if (!existingMetrics.has(columnName)) {
          // Generate smart defaults based on column name
          const suggestion = generateMetricSuggestion(columnName, template);
          newMetrics.push({
            ...suggestion,
            data_template_id: template.id,
            template_name: template.template_name,
            source: 'auto-discovered'
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        count: newMetrics.length,
        metrics: newMetrics
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error discovering metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

/**
 * Bulk commit discovered metrics to metric_definitions
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers }
      );
    }

    const body = await request.json() as {
      metrics: Array<{
        metric_name: string;
        display_name: string;
        data_template_id: number;
        formula: string;
        format_type: string;
        decimal_places: number;
        prefix?: string;
        suffix?: string;
        category?: string;
        description?: string;
      }>;
    };

    const { metrics } = body;

    if (!metrics || metrics.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No metrics provided' }),
        { status: 400, headers }
      );
    }

    // Get current max display_order
    const maxOrderResult = await db
      .prepare('SELECT MAX(display_order) as max_order FROM metric_definitions')
      .first();

    let displayOrder = ((maxOrderResult as any)?.max_order || 0) + 1;

    // Insert all metrics
    const inserted = [];
    for (const metric of metrics) {
      const result = await db
        .prepare(
          `INSERT INTO metric_definitions (
            metric_name,
            display_name,
            data_template_id,
            formula,
            format_type,
            decimal_places,
            prefix,
            suffix,
            category,
            description,
            display_order,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
        )
        .bind(
          metric.metric_name,
          metric.display_name,
          metric.data_template_id,
          metric.formula,
          metric.format_type,
          metric.decimal_places,
          metric.prefix || null,
          metric.suffix || null,
          metric.category || null,
          metric.description || null,
          displayOrder++
        )
        .run();

      inserted.push({
        id: result.meta.last_row_id,
        ...metric
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: inserted.length,
        metrics: inserted
      }),
      { status: 201, headers }
    );
  } catch (error: any) {
    console.error('Error committing metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

/**
 * Generate smart metric suggestions based on column name patterns
 */
function generateMetricSuggestion(columnName: string, template: any) {
  const lower = columnName.toLowerCase();
  
  // Default values
  let displayName = formatDisplayName(columnName);
  let formatType = 'number';
  let decimalPlaces = 0;
  let prefix = '';
  let suffix = '';
  let category = 'Uncategorized';
  let description = `${displayName} from ${template.template_name}`;
  let isFilter = false;

  // Check if this is a filter/lookup column (not a metric)
  if (
    lower.includes('_code') ||
    lower.includes('_id') ||
    lower.includes('segment') ||
    lower.includes('channel') ||
    lower.includes('market') ||
    lower.includes('source') ||
    lower === 'date' ||
    lower === 'stay_date' ||
    lower === 'arrival_date' ||
    lower === 'departure_date' ||
    lower.includes('_date') ||
    lower.includes('_name') ||
    lower.includes('_type') ||
    lower.includes('category') ||
    lower.includes('group_by')
  ) {
    isFilter = true;
    formatType = 'filter';
    category = 'Filter/Lookup';
    description = `Filter/grouping column: ${displayName}`;
  }
  // ADR and RevPAR patterns - MUST come before general revenue
  else if (lower.includes('adr') || lower.includes('revpar')) {
    formatType = 'currency';
    decimalPlaces = 2;
    prefix = '$';
    category = 'Revenue';
    description = `Rate metric: ${displayName}`;
  }
  // Revenue patterns (but not ADR/RevPAR)
  else if (lower.includes('rev') || lower.includes('revenue')) {
    formatType = 'currency';
    decimalPlaces = 0;
    prefix = '$';
    category = 'Revenue';
    description = `Revenue metric: ${displayName}`;
  }
  // Occupancy/Percentage patterns
  else if (lower.includes('occ') || lower.includes('occupancy') || lower.includes('pct') || lower.includes('percent')) {
    formatType = 'percentage';
    decimalPlaces = 1;
    suffix = '%';
    category = 'Performance';
    description = `Occupancy/percentage metric: ${displayName}`;
  }
  // Room patterns
  else if (lower.includes('room') || lower.includes('rms')) {
    formatType = 'number';
    decimalPlaces = 0;
    category = 'Occupancy';
    description = `Room count metric: ${displayName}`;
  }
  // Nights patterns
  else if (lower.includes('night') || lower.includes('nts')) {
    formatType = 'number';
    decimalPlaces = 0;
    category = 'Occupancy';
    description = `Night count metric: ${displayName}`;
  }
  // Guests patterns
  else if (lower.includes('guest') || lower.includes('pax')) {
    formatType = 'number';
    decimalPlaces = 0;
    category = 'Occupancy';
    description = `Guest count metric: ${displayName}`;
  }
  // Forecast patterns
  else if (lower.includes('forecast') || lower.includes('fcst')) {
    category = 'Forecast';
    description = `Forecast metric: ${displayName}`;
  }
  // Budget patterns
  else if (lower.includes('budget') || lower.includes('bdgt')) {
    category = 'Budget';
    description = `Budget metric: ${displayName}`;
  }
  // Last year patterns
  else if (lower.includes('ly') || lower.includes('last_year') || lower.includes('stly')) {
    category = 'Historical';
    description = `Historical comparison: ${displayName}`;
  }
  // OTB (On The Books) patterns
  else if (lower.includes('otb')) {
    category = 'Current';
    description = `Current booking data: ${displayName}`;
  }
  // Cancelled patterns
  else if (lower.includes('cancel')) {
    category = 'Cancellations';
    description = `Cancellation metric: ${displayName}`;
  }
  // No-show patterns
  else if (lower.includes('noshow') || lower.includes('no_show')) {
    category = 'No-Shows';
    description = `No-show metric: ${displayName}`;
  }

  return {
    metric_name: columnName,
    display_name: displayName,
    formula: columnName, // Just the column name for raw metrics
    format_type: formatType,
    decimal_places: decimalPlaces,
    prefix,
    suffix,
    category,
    description,
    is_filter: isFilter
  };
}

/**
 * Convert snake_case or camelCase to Title Case
 */
function formatDisplayName(columnName: string): string {
  return columnName
    // Split on underscores or capital letters
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    // Capitalize each word
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
    // Handle common abbreviations
    .replace(/\bOtb\b/g, 'OTB')
    .replace(/\bStly\b/g, 'STLY')
    .replace(/\bSt2y\b/g, 'ST2Y')
    .replace(/\bLy\b/g, 'LY')
    .replace(/\bRev\b/g, 'Revenue')
    .replace(/\bRms\b/g, 'Rooms')
    .replace(/\bAdr\b/g, 'ADR')
    .replace(/\bFcst\b/g, 'Forecast')
    .replace(/\bBdgt\b/g, 'Budget')
    .replace(/\bActual\b/g, 'Actual');
}


