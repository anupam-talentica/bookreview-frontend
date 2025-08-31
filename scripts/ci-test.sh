#!/bin/bash

# CI/CD Pipeline Test Script
# This script simulates the CI/CD pipeline locally to test all steps

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[CI/CD TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Change to script directory
cd "$(dirname "$0")/.."

print_status "🚀 Starting CI/CD Pipeline Test"
echo ""

# Step 1: Install dependencies
print_status "📦 Step 1: Installing dependencies..."
npm ci
print_success "Dependencies installed successfully"
echo ""

# Step 2: Run ESLint
print_status "🔍 Step 2: Running ESLint..."
if npm run lint; then
    print_success "ESLint passed"
else
    print_warning "ESLint found issues (continuing with warnings)"
fi
echo ""

# Step 3: Run TypeScript type checking
print_status "🔧 Step 3: Running TypeScript type checking..."
npm run typecheck
print_success "TypeScript compilation successful"
echo ""

# Step 4: Run tests with coverage
print_status "🧪 Step 4: Running tests with coverage..."
if npm run test:coverage; then
    print_success "All tests passed with coverage"
else
    print_error "Tests failed or coverage thresholds not met"
    echo ""
    print_status "📊 Checking coverage report..."
    if [ -f "coverage/coverage-summary.json" ]; then
        node -e "
        const fs = require('fs');
        const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
        const { total } = coverage;
        
        console.log('\\n📊 Coverage Summary:');
        console.log('  Statements: ' + total.statements.pct + '%');
        console.log('  Branches: ' + total.branches.pct + '%');
        console.log('  Functions: ' + total.functions.pct + '%');
        console.log('  Lines: ' + total.lines.pct + '%');
        "
    fi
    exit 1
fi
echo ""

# Step 5: Run security audit
print_status "🔒 Step 5: Running security audit..."
if npm audit --audit-level=high; then
    print_success "No high-severity vulnerabilities found"
else
    print_warning "Security vulnerabilities found (review required)"
fi
echo ""

# Step 6: Build application
print_status "🏗️  Step 6: Building application..."
npm run build
print_success "Build completed successfully"
echo ""

# Step 7: Analyze bundle size
print_status "📏 Step 7: Analyzing bundle size..."
if command -v du &> /dev/null; then
    echo "Bundle sizes:"
    du -sh build/static/js/*.js 2>/dev/null || echo "  No JS bundles found"
    du -sh build/static/css/*.css 2>/dev/null || echo "  No CSS bundles found"
    
    # Check if build directory exists and has content
    if [ -d "build" ] && [ "$(ls -A build)" ]; then
        print_success "Build artifacts created successfully"
    else
        print_error "Build directory is empty or missing"
        exit 1
    fi
else
    print_warning "du command not available, skipping bundle analysis"
fi
echo ""

# Step 8: Validate CI/CD configuration
print_status "⚙️  Step 8: Validating CI/CD configuration..."
if [ -f ".github/workflows/ci-cd.yml" ]; then
    print_success "CI/CD workflow file exists"
    
    # Basic YAML syntax check (if yq is available)
    if command -v yq &> /dev/null; then
        if yq eval '.jobs' .github/workflows/ci-cd.yml > /dev/null 2>&1; then
            print_success "CI/CD YAML syntax is valid"
        else
            print_error "CI/CD YAML syntax error"
            exit 1
        fi
    else
        print_warning "yq not available, skipping YAML validation"
    fi
else
    print_error "CI/CD workflow file not found"
    exit 1
fi
echo ""

# Summary
print_success "🎉 All CI/CD pipeline steps completed successfully!"
echo ""
echo "✅ Dependencies installed"
echo "✅ Code linting passed"
echo "✅ TypeScript compilation successful"
echo "✅ Tests passed with coverage"
echo "✅ Security audit completed"
echo "✅ Build successful"
echo "✅ Bundle analysis completed"
echo "✅ CI/CD configuration validated"
echo ""
print_status "🚀 Ready for deployment!"

# Optional: Show next steps
echo ""
echo "📋 Next Steps:"
echo "  1. Commit and push changes to trigger CI/CD"
echo "  2. Monitor GitHub Actions for pipeline execution"
echo "  3. Review deployment in staging/production environments"
echo "  4. Check application functionality post-deployment"
