#!/bin/bash

# BookReview Frontend Test Runner Script
# This script provides various testing options for the frontend application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Function to check if npm is available
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed or not in PATH"
        exit 1
    fi
}

# Function to install dependencies if needed
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm ci
        print_success "Dependencies installed"
    fi
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    npm test -- --watchAll=false --coverage
    print_success "All tests completed"
}

# Function to run tests in watch mode
run_watch_tests() {
    print_status "Running tests in watch mode..."
    print_warning "Press 'q' to quit watch mode"
    npm test
}

# Function to run tests with coverage
run_coverage_tests() {
    print_status "Running tests with coverage report..."
    npm test -- --watchAll=false --coverage --coverageReporters=text-lcov --coverageReporters=html
    print_success "Coverage report generated in coverage/ directory"
}

# Function to run specific test file
run_specific_test() {
    local test_file="$1"
    if [ -z "$test_file" ]; then
        print_error "Please provide a test file name"
        exit 1
    fi
    
    print_status "Running specific test: $test_file"
    npm test -- --watchAll=false "$test_file"
}

# Function to run tests matching a pattern
run_pattern_tests() {
    local pattern="$1"
    if [ -z "$pattern" ]; then
        print_error "Please provide a test pattern"
        exit 1
    fi
    
    print_status "Running tests matching pattern: $pattern"
    npm test -- --watchAll=false --testNamePattern="$pattern"
}

# Function to run linting
run_lint() {
    print_status "Running ESLint..."
    if command -v npx &> /dev/null; then
        npx eslint src --ext .js,.jsx,.ts,.tsx
        print_success "Linting completed"
    else
        print_warning "ESLint not available, skipping..."
    fi
}

# Function to run type checking
run_type_check() {
    print_status "Running TypeScript type checking..."
    if command -v npx &> /dev/null; then
        npx tsc --noEmit
        print_success "Type checking completed"
    else
        print_warning "TypeScript not available, skipping..."
    fi
}

# Function to run all quality checks
run_quality_checks() {
    print_status "Running all quality checks..."
    
    # Type checking
    run_type_check
    
    # Linting
    run_lint
    
    # Tests with coverage
    run_coverage_tests
    
    print_success "All quality checks completed"
}

# Function to clean test artifacts
clean_test_artifacts() {
    print_status "Cleaning test artifacts..."
    
    # Remove coverage directory
    if [ -d "coverage" ]; then
        rm -rf coverage
        print_status "Removed coverage directory"
    fi
    
    # Remove test results
    if [ -d "test-results" ]; then
        rm -rf test-results
        print_status "Removed test-results directory"
    fi
    
    # Clear Jest cache
    if command -v npx &> /dev/null; then
        npx jest --clearCache
        print_status "Cleared Jest cache"
    fi
    
    print_success "Test artifacts cleaned"
}

# Function to show test statistics
show_test_stats() {
    print_status "Analyzing test files..."
    
    local test_files=$(find src -name "*.test.*" -o -name "*.spec.*" | wc -l)
    local test_dirs=$(find src -name "__tests__" -type d | wc -l)
    local total_tests=$(grep -r "it\|test" src/__tests__ --include="*.ts" --include="*.tsx" | wc -l)
    
    echo ""
    echo "📊 Test Statistics:"
    echo "   Test files: $test_files"
    echo "   Test directories: $test_dirs"
    echo "   Total test cases: ~$total_tests"
    echo ""
}

# Function to show help
show_help() {
    echo "BookReview Frontend Test Runner"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  all                    Run all tests once"
    echo "  watch                  Run tests in watch mode"
    echo "  coverage               Run tests with coverage report"
    echo "  specific <file>        Run specific test file"
    echo "  pattern <pattern>      Run tests matching pattern"
    echo "  lint                   Run ESLint"
    echo "  typecheck              Run TypeScript type checking"
    echo "  quality                Run all quality checks (lint + typecheck + tests)"
    echo "  clean                  Clean test artifacts"
    echo "  stats                  Show test statistics"
    echo "  help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all                           # Run all tests"
    echo "  $0 watch                         # Run tests in watch mode"
    echo "  $0 coverage                      # Run tests with coverage"
    echo "  $0 specific LoginPage.test.tsx   # Run specific test file"
    echo "  $0 pattern \"should render\"       # Run tests with specific pattern"
    echo "  $0 quality                       # Run all quality checks"
    echo ""
}

# Main script logic
main() {
    # Check prerequisites
    check_npm
    
    # Change to script directory
    cd "$(dirname "$0")/.."
    
    # Parse command line arguments
    case "${1:-help}" in
        "all")
            install_dependencies
            run_all_tests
            ;;
        "watch")
            install_dependencies
            run_watch_tests
            ;;
        "coverage")
            install_dependencies
            run_coverage_tests
            ;;
        "specific")
            install_dependencies
            run_specific_test "$2"
            ;;
        "pattern")
            install_dependencies
            run_pattern_tests "$2"
            ;;
        "lint")
            install_dependencies
            run_lint
            ;;
        "typecheck")
            install_dependencies
            run_type_check
            ;;
        "quality")
            install_dependencies
            run_quality_checks
            ;;
        "clean")
            clean_test_artifacts
            ;;
        "stats")
            show_test_stats
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"
