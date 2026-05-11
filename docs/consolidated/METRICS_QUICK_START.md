# Metrics System Quick Start

## Step-by-Step Setup

### 1. Run the Migration

1. Go to **Admin Panel** (`/admin`)
2. Click the **"Metrics & Templates"** tab
3. Click **"Run Migration"** button
4. Confirm the migration
5. You should see a success message

This creates the `data_templates` and `metric_definitions` tables.

---

### 2. Create Your First Data Template

A data template defines what raw data to fetch from BigQuery.

**Example: Hotel Performance Data**

1. Click **"Data Templates"** tab
2. Click **"+ New Template"**
3. Fill in the form:

```
Template Name: Hotel Performance
Description: Daily revenue and occupancy metrics
Output Columns: date, revenue, rooms_sold, rooms_available

Query Template:
SELECT 
  DATE(date) as date,
  SUM(revenue) as revenue,
  SUM(rooms_sold) as rooms_sold,
  SUM(rooms_available) as rooms_available
FROM `your-project.your-dataset.your-table`
WHERE hotel_code = @hotel_code
  AND EXTRACT(YEAR FROM date) = @year
  AND EXTRACT(MONTH FROM date) = @month
GROUP BY date
ORDER BY date
```

4. Click **"Save Template"**

---

### 3. Create Metrics from the Template

Now create metrics that calculate from this data.

#### Metric 1: ADR (Average Daily Rate)

1. Go to **"Metrics"** tab
2. Click **"+ New Metric"**
3. Fill in:

```
Metric Name: ADR
Data Source: Hotel Performance
Formula: revenue / rooms_sold
Format Type: Currency
Decimals: 2
Prefix: $
Category: Revenue
Description: Average Daily Rate - Revenue per room sold
```

4. Click **"Save Metric"**

#### Metric 2: Occupancy Rate

```
Metric Name: Occupancy
Data Source: Hotel Performance
Formula: (rooms_sold / rooms_available) * 100
Format Type: Percentage
Decimals: 1
Suffix: %
Category: Occupancy
Description: Percentage of rooms occupied
```

#### Metric 3: RevPAR

```
Metric Name: RevPAR
Data Source: Hotel Performance
Formula: revenue / rooms_available
Format Type: Currency
Decimals: 2
Prefix: $
Category: Revenue
Description: Revenue Per Available Room
```

---

### 4. View Your Metrics Dashboard

1. Go to **"Overview"** tab in Metrics Manager
2. You'll see:
   - Total data templates: 1
   - Total metrics: 3
   - Metrics grouped by template

This gives you a visual catalog of all available metrics.

---

## How It Works

### Data Flow

```
1. User selects hotel + date range
   ↓
2. System checks cache for raw data
   ↓
3. If no cache, runs BigQuery query (data template)
   ↓
4. Raw data cached in database
   ↓
5. For each metric definition:
   - Load cached data
   - Apply formula
   - Format result
   ↓
6. Display formatted metrics in dashboard
```

### Example Data Flow

**Data Template Query Returns:**
```json
[
  { "date": "2024-01-01", "revenue": 50000, "rooms_sold": 100, "rooms_available": 120 },
  { "date": "2024-01-02", "revenue": 52000, "rooms_sold": 105, "rooms_available": 120 },
  ...
]
```

**Metric Calculations:**
- **ADR**: `50000 / 100 = $500.00`
- **Occupancy**: `(100 / 120) * 100 = 83.3%`
- **RevPAR**: `50000 / 120 = $416.67`

---

## Advanced Examples

### Multiple Data Sources

You can create different data templates for different purposes:

**Template 1: Daily Performance**
- Columns: date, revenue, rooms_sold, rooms_available
- Metrics: ADR, Occupancy, RevPAR

**Template 2: Revenue Breakdown**
- Columns: date, room_revenue, fb_revenue, other_revenue
- Metrics: Total Revenue, Room %, F&B %, Other %

**Template 3: Channel Performance**
- Columns: channel, bookings, revenue, cancellations
- Metrics: Channel Revenue, Conversion Rate, Cancellation Rate

### Complex Formulas

Formulas can use basic math operators:

```
Addition:       room_revenue + fb_revenue
Subtraction:    revenue - costs
Multiplication: price * quantity
Division:       revenue / rooms_sold
Parentheses:    (revenue - costs) / revenue * 100
```

### Formatting Options

**Currency:**
- Format Type: Currency
- Prefix: $
- Decimals: 2
- Example: $1,234.56

**Percentage:**
- Format Type: Percentage
- Suffix: %
- Decimals: 1
- Example: 83.3%

**Number:**
- Format Type: Number
- Decimals: 0
- Example: 1,234

---

## Tips & Best Practices

### 1. Name Columns Clearly
Use descriptive column names in your BigQuery queries:
- ✅ `rooms_sold`, `rooms_available`
- ❌ `col1`, `col2`

### 2. Group Related Metrics
Use the category field to organize metrics:
- Revenue: ADR, RevPAR, Total Revenue
- Occupancy: Occupancy %, Rooms Sold
- Performance: Conversion Rate, Cancellation Rate

### 3. Set Display Order
Use the display_order field to control how metrics appear:
- 0: Most important (shows first)
- 10, 20, 30: Secondary metrics

### 4. Add Descriptions
Write clear descriptions for each metric:
- Helps users understand what they're looking at
- Documents calculation methodology
- Useful for onboarding new team members

### 5. Test Formulas
Before creating a metric:
1. Check available columns in the data template
2. Verify column names match exactly
3. Test formula logic with sample data

---

## Troubleshooting

### "Column not found" Error
- Check that column name in formula matches data template output_columns
- Column names are case-sensitive

### Metric Shows Wrong Value
- Verify formula uses correct columns
- Check operator precedence (use parentheses)
- Ensure data template query returns expected columns

### No Data in Cache
- Make sure hotel credentials are configured
- Check BigQuery query syntax in data template
- Verify table exists and has data for selected date range

---

## Next Steps

1. ✅ Set up your data templates
2. ✅ Create metric definitions
3. 🔄 Update client dashboard to display metrics (coming next)
4. 🔄 Add charts and visualizations
5. 🔄 Implement date range comparisons
