#!/bin/bash
set -e

echo "========================================================"
echo "🚀 Starting CI Simulation Pipeline"
echo "========================================================"

# 1. Format Check
echo "\n[1/4] 🎨 Checking Code Formatting (Prettier)..."
npm run prettier:verify

# 2. Linting
echo "\n[2/4] 🧹 Running Linters..."
echo "  - LWC/JS Linting..."
npm run lint

if command -v sf >/dev/null 2>&1 && sf scanner --help >/dev/null 2>&1; then
    echo "  - Apex Static Analysis..."
    npm run lint:apex
else
    echo "  ⚠️  Skipping Apex Scanner (sf scanner not installed)"
fi

# 3. Unit Tests
echo "\n[3/4] 🧪 Running Unit Tests..."
echo "  - LWC Jest Tests..."
npm run test:unit

echo "  - Apex Tests..."
# Run local tests and check coverage
sf apex run test --test-level RunLocalTests --code-coverage --result-format human --wait 10

# 4. E2E Tests (Smoke)
echo "\n[4/4] 🎭 Running E2E Smoke Tests..."
npm run test:smoke

echo "\n========================================================"
echo "✅ CI Pipeline Completed Successfully!"
echo "========================================================"
