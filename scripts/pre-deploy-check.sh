#!/bin/bash
# Pre-deployment verification script
# Run: bash scripts/pre-deploy-check.sh

set -e

echo "═══════════════════════════════════════════════════"
echo "  Pre-Deployment Verification"
echo "═══════════════════════════════════════════════════"
echo ""

# Check 1: TypeScript
echo "✓ Checking TypeScript..."
npm run type-check > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ TypeScript check passed"
else
  echo "  ✗ TypeScript check failed"
  exit 1
fi

# Check 2: ESLint
echo ""
echo "✓ Checking ESLint..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ ESLint check passed"
else
  echo "  ✗ ESLint check failed"
  exit 1
fi

# Check 3: Build
echo ""
echo "✓ Building application..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Build successful"
else
  echo "  ✗ Build failed"
  exit 1
fi

# Check 4: Environment variables
echo ""
echo "✓ Checking environment variables..."
REQUIRED_VARS=("DATABASE_URL" "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "CLERK_SECRET_KEY" "TENCENT_SECRET_ID" "TENCENT_SECRET_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
  echo "  ✓ All required environment variables are set"
else
  echo "  ⚠ Warning: Missing environment variables: ${MISSING_VARS[*]}"
  echo "    Set these before deploying to production"
fi

# Check 5: Git status
echo ""
echo "✓ Checking Git status..."
if git diff --quiet && git diff --cached --quiet; then
  echo "  ✓ Working tree clean"
else
  echo "  ⚠ Warning: Uncommitted changes detected"
  echo "    Commit or stash changes before deploying"
fi

# Check 6: Database migration
echo ""
echo "✓ Checking database migration..."
if [ -f "prisma/migrations/migration_lock.toml" ]; then
  echo "  ✓ Database migration lock file exists"
else
  echo "  ⚠ Warning: Database migration not set up"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✓ Pre-deployment checks completed"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Review all warnings above"
echo "  2. Verify environment variables are correct"
echo "  3. Test on staging environment"
echo "  4. Deploy to production"
echo ""
