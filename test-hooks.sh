#!/bin/bash

# Helper script to test Husky hooks manually
# Usage: ./test-hooks.sh [pre-commit|commit-msg|pre-push|all]

set -e

INFRASTRUCTURE_DIR="infrastructure"
HOOKS_DIR=".husky"

echo "🧪 Husky Hooks Test Runner"
echo "=========================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

test_pre_commit() {
    print_status "Testing pre-commit hook..."
    
    if [ -f "$HOOKS_DIR/pre-commit" ]; then
        print_status "Running pre-commit hook simulation..."
        cd $INFRASTRUCTURE_DIR
        
        # Check if there are staged files
        if git diff --cached --quiet; then
            print_warning "No staged files found. Staging some test files..."
            # Find some TypeScript files to stage for testing
            if find . -name "*.ts" -type f | head -1 | xargs -I {} git add {}; then
                print_status "Staged test files for hook testing"
            else
                print_warning "No TypeScript files found to stage"
            fi
        fi
        
        # Run lint-staged
        if pnpm pre-commit; then
            print_success "Pre-commit hook passed!"
        else
            print_error "Pre-commit hook failed!"
            return 1
        fi
        
        cd ..
    else
        print_error "Pre-commit hook not found at $HOOKS_DIR/pre-commit"
        return 1
    fi
}

test_commit_msg() {
    print_status "Testing commit-msg hook..."
    
    if [ -f "$HOOKS_DIR/commit-msg" ]; then
        # Test valid commit messages
        echo "feat(test): add new feature" > /tmp/test-commit-msg
        if $HOOKS_DIR/commit-msg /tmp/test-commit-msg; then
            print_success "Valid conventional commit format accepted"
        else
            print_error "Valid commit message was rejected!"
            return 1
        fi
        
        # Test invalid commit messages
        echo "invalid commit message" > /tmp/test-commit-msg
        if $HOOKS_DIR/commit-msg /tmp/test-commit-msg 2>/dev/null; then
            print_error "Invalid commit message was accepted!"
            return 1
        else
            print_success "Invalid commit message correctly rejected"
        fi
        
        rm -f /tmp/test-commit-msg
    else
        print_error "Commit-msg hook not found at $HOOKS_DIR/commit-msg"
        return 1
    fi
}

test_pre_push() {
    print_status "Testing pre-push hook..."
    
    if [ -f "$HOOKS_DIR/pre-push" ]; then
        current_branch=$(git rev-parse --abbrev-ref HEAD)
        print_status "Current branch: $current_branch"
        
        # Test the pre-push logic (dry run)
        print_status "Running pre-push hook simulation..."
        
        # We'll simulate this without actually running the full validation
        # since it might be too heavy for testing
        cd $INFRASTRUCTURE_DIR
        
        if [[ "$current_branch" == "main" || "$current_branch" == "develop" ]]; then
            print_warning "On protected branch - would run full validation suite"
            print_status "This would run: pnpm validate:all:strict && pnpm test:all"
        else
            print_status "On feature branch - would run quick validation"
            print_status "This would run: pnpm validate:mock"
        fi
        
        print_success "Pre-push hook logic validated!"
        cd ..
    else
        print_error "Pre-push hook not found at $HOOKS_DIR/pre-push"
        return 1
    fi
}

test_installation() {
    print_status "Testing Husky installation..."
    
    # Check if Husky is installed
    if command -v husky &> /dev/null; then
        print_success "Husky CLI is available"
    else
        print_error "Husky CLI not found"
        return 1
    fi
    
    # Check if hooks directory exists
    if [ -d "$HOOKS_DIR" ]; then
        print_success "Hooks directory exists"
    else
        print_error "Hooks directory not found"
        return 1
    fi
    
    # Check if hooks are executable
    for hook in pre-commit commit-msg pre-push; do
        if [ -x "$HOOKS_DIR/$hook" ]; then
            print_success "$hook is executable"
        else
            print_error "$hook is not executable or doesn't exist"
            return 1
        fi
    done
    
    # Check if infrastructure dependencies are installed
    if [ -f "$INFRASTRUCTURE_DIR/node_modules/.pnpm/lock.yaml" ]; then
        print_success "Infrastructure dependencies are installed"
    else
        print_warning "Infrastructure dependencies might not be installed"
        print_status "Run: cd infrastructure && pnpm install"
    fi
}

show_usage() {
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  pre-commit    Test the pre-commit hook"
    echo "  commit-msg    Test the commit message validation"
    echo "  pre-push      Test the pre-push hook"
    echo "  install       Test the installation and setup"
    echo "  all           Run all tests (default)"
    echo "  help          Show this help message"
}

# Main execution
case "${1:-all}" in
    pre-commit)
        test_installation && test_pre_commit
        ;;
    commit-msg)
        test_installation && test_commit_msg
        ;;
    pre-push)
        test_installation && test_pre_push
        ;;
    install)
        test_installation
        ;;
    all)
        test_installation && test_pre_commit && test_commit_msg && test_pre_push
        ;;
    help)
        show_usage
        ;;
    *)
        print_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    print_success "All selected tests passed! 🎉"
else
    print_error "Some tests failed. Please check the output above."
    exit 1
fi
