#!/bin/bash

# Test script for democracy-platform stack operations (prod and dev)
# Usage: ./test-stacks.sh [prod|dev|both]

set -e

STACK_TYPE=${1:-both}
PROJECT_DIR="/Users/manuelruck/Work/democracy/repos/infrastructure/infrastructure/democracy-platform"

cd "$PROJECT_DIR"

echo "🔧 Testing democracy-platform stacks..."
echo "Working directory: $(pwd)"

test_stack() {
    local stack_name=$1
    echo ""
    echo "=================="
    echo "Testing stack: $stack_name"
    echo "=================="
    
    # Select stack
    echo "📋 Selecting stack $stack_name..."
    pulumi stack select "$stack_name"
    
    # Show current config
    echo ""
    echo "📝 Current configuration:"
    pulumi config --show-secrets
    
    # Preview
    echo ""
    echo "👀 Running preview..."
    if pulumi preview; then
        echo "✅ Preview successful for $stack_name"
    else
        echo "❌ Preview failed for $stack_name"
        return 1
    fi
    
    echo ""
    echo "⚠️  Ready for deployment test?"
    echo "   Next step would be: pulumi up"
    echo "   For destroy test: pulumi destroy"
    echo ""
}

# Test based on input
case $STACK_TYPE in
    "prod"|"production")
        test_stack "production"
        ;;
    "dev"|"development")  
        test_stack "dev"
        ;;
    "both")
        test_stack "production"
        test_stack "dev"
        ;;
    *)
        echo "❌ Invalid stack type. Use: prod, dev, or both"
        exit 1
        ;;
esac

echo ""
echo "🎉 Stack tests completed!"
echo ""
echo "Next steps:"
echo "  1. Deploy: pulumi stack select [production|dev] && pulumi up"
echo "  2. Test: Run your application tests"  
echo "  3. Destroy (dev only): pulumi stack select dev && pulumi destroy"
echo ""
