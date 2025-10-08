
#!/bin/bash
echo "🚀 Peoria Platform - Supabase Migration Helper"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the app directory"
    echo "   cd /home/ubuntu/peoria_onticworks/app"
    echo "   ./migrate-to-supabase.sh"
    exit 1
fi

# Step 1: Verify backup exists
if [ ! -f "backups/peoria-backup-2025-09-24.json" ]; then
    echo "❌ Backup file not found. Creating backup first..."
    npx tsx --require dotenv/config scripts/export-data.ts
else
    echo "✅ Data backup found: backups/peoria-backup-2025-09-24.json"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Create Supabase project at: https://supabase.com"
echo "2. Get your connection string from Settings → Database"
echo "3. Update DATABASE_URL in your .env file"
echo "4. Run the migration commands below"
echo ""

echo "🔧 Migration Commands:"
echo "----------------------"
echo "# Step 1: Push schema to Supabase"
echo "yarn prisma generate"
echo "yarn prisma db push"
echo ""
echo "# Step 2: Import your data"
echo "npx tsx --require dotenv/config scripts/import-to-supabase.ts backups/peoria-backup-2025-09-24.json"
echo ""
echo "# Step 3: Verify migration"
echo "npx tsx --require dotenv/config scripts/verify-migration.ts"
echo ""
echo "# Step 4: Test your app"
echo "yarn dev"
echo ""

echo "📚 For detailed instructions, see: SUPABASE_MIGRATION_GUIDE.md"
echo ""

read -p "Do you want to open the migration guide? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v code &> /dev/null; then
        code ../SUPABASE_MIGRATION_GUIDE.md
        echo "📖 Migration guide opened in VS Code"
    else
        cat ../SUPABASE_MIGRATION_GUIDE.md
    fi
fi

echo ""
echo "🎯 Ready for migration! Follow the guide for step-by-step instructions."
