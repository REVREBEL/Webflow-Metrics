#!/bin/bash

# BigQuery Dashboard - D1 Database Setup Script
# This script will create and configure your D1 database

echo "🚀 BigQuery Dashboard - D1 Setup"
echo "=================================="
echo ""

# Check if wrangler is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js and npm first."
    exit 1
fi

echo "Step 1: Creating D1 database..."
echo "Running: npx wrangler d1 create bigquery-dashboard"
echo ""

# Create the database and capture output
OUTPUT=$(npx wrangler d1 create bigquery-dashboard 2>&1)
echo "$OUTPUT"

# Extract database_id from output
DATABASE_ID=$(echo "$OUTPUT" | grep "database_id" | sed -E 's/.*database_id = "([^"]+)".*/\1/')

if [ -z "$DATABASE_ID" ]; then
    echo ""
    echo "⚠️  Could not automatically extract database_id."
    echo "Please check the output above and manually update wrangler.jsonc"
    echo ""
    echo "Look for a line like:"
    echo '  database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"'
    echo ""
    echo "Copy that ID and update wrangler.jsonc line 32:"
    echo '  "database_id": "paste-your-id-here"'
    echo ""
    read -p "Press Enter to continue with schema setup..."
else
    echo ""
    echo "✅ Database created successfully!"
    echo "📝 Database ID: $DATABASE_ID"
    echo ""
    echo "Updating wrangler.jsonc..."
    
    # Update wrangler.jsonc with the actual database_id
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"database_id\": \"your-database-id\"/\"database_id\": \"$DATABASE_ID\"/" wrangler.jsonc
    else
        # Linux
        sed -i "s/\"database_id\": \"your-database-id\"/\"database_id\": \"$DATABASE_ID\"/" wrangler.jsonc
    fi
    
    echo "✅ wrangler.jsonc updated!"
fi

echo ""
echo "Step 2: Initializing database schema (LOCAL)..."
echo "Running: npx wrangler d1 execute DB --local --file=./schema.sql"
echo ""

npx wrangler d1 execute DB --local --file=./schema.sql

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start dev server: npm run dev"
echo "2. Open admin panel: http://localhost:3000/admin"
echo "3. Add your first hotel with BigQuery credentials"
echo ""
echo "📚 For more help, see:"
echo "- QUICK_START_GUIDE.md"
echo "- DASHBOARD_SETUP.md"
echo "- D1_SETUP.md"
echo ""
