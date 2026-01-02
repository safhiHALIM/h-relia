#!/bin/bash

# NeoSafi Store API Test Script
# Tests the core functionality of the access link system and basic API endpoints

echo "🚀 NeoSafi Store API Testing Script"
echo "=================================="

BASE_URL="http://localhost:3000"
COOKIE_FILE="test_cookies.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

# Function to make HTTP request and check status
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -b "$COOKIE_FILE" \
            -c "$COOKIE_FILE")
    else
        response=$(curl -s -w "%{http_code}" -X $method "$BASE_URL$endpoint" \
            -b "$COOKIE_FILE" \
            -c "$COOKIE_FILE")
    fi
    
    status_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        print_result 0 "$description"
        return 0
    else
        print_result 1 "$description (Expected: $expected_status, Got: $status_code)"
        return 1
    fi
}

echo ""
echo -e "${BLUE}Testing Basic API Endpoints${NC}"
echo "----------------------------"

# Test 1: Get categories
test_endpoint "GET" "/api/categories" "" "200" "Get categories"

# Test 2: Get products
test_endpoint "GET" "/api/products" "" "200" "Get products"

# Test 3: Get featured products
test_endpoint "GET" "/api/products/featured/list" "" "200" "Get featured products"

# Test 4: Get single product
test_endpoint "GET" "/api/products/1" "" "200" "Get single product"

echo ""
echo -e "${BLUE}Testing Authentication${NC}"
echo "----------------------"

# Test 5: Admin login
admin_login_data='{"email":"admin@neosafi.com","password":"admin123"}'
test_endpoint "POST" "/api/admin/login" "$admin_login_data" "200" "Admin login"

# Test 6: Check admin session
test_endpoint "GET" "/api/admin/check" "" "200" "Check admin session"

echo ""
echo -e "${BLUE}Testing Access Link System${NC}"
echo "----------------------------"

# Test 7: Generate access link
generate_link_data='{"expires_hours":1}'
echo "Generating access link..."
response=$(curl -s -X POST "$BASE_URL/api/generate-link" \
    -H "Content-Type: application/json" \
    -d "$generate_link_data" \
    -b "$COOKIE_FILE")

# Extract token from response
token=$(echo $response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$token" ]; then
    print_result 0 "Generate access link"
    echo -e "${YELLOW}Generated token: ${token:0:8}...${NC}"
    
    # Test 8: Check access link
    device_id="test_device_$(date +%s)"
    check_link_data="{\"token\":\"$token\",\"deviceId\":\"$device_id\"}"
    test_endpoint "POST" "/api/check-link" "$check_link_data" "200" "Check access link (first use)"
    
    # Test 9: Check same link again (should still work with same device)
    test_endpoint "POST" "/api/check-link" "$check_link_data" "200" "Check access link (same device)"
    
    # Test 10: Check with different device (should fail)
    different_device_id="different_device_$(date +%s)"
    different_device_data="{\"token\":\"$token\",\"deviceId\":\"$different_device_id\"}"
    test_endpoint "POST" "/api/check-link" "$different_device_data" "403" "Check access link (different device - should fail)"
    
else
    print_result 1 "Generate access link (no token received)"
fi

# Test 11: List access links
test_endpoint "GET" "/api/admin/access-links" "" "200" "List access links"

echo ""
echo -e "${BLUE}Testing Order System${NC}"
echo "--------------------"

# Test 12: Create order (guest order)
order_data='{
    "items": [
        {"product_id": 1, "quantity": 2, "price": 999.99},
        {"product_id": 2, "quantity": 1, "price": 299.99}
    ],
    "total": 2299.97,
    "customer_info": {
        "firstName": "Test",
        "lastName": "Customer",
        "email": "test@example.com",
        "phone": "+1234567890",
        "address": "123 Test St",
        "city": "Test City",
        "zipCode": "12345"
    }
}'
test_endpoint "POST" "/api/orders" "$order_data" "200" "Create order"

# Test 13: Get admin orders
test_endpoint "GET" "/api/admin/orders" "" "200" "Get admin orders"

echo ""
echo -e "${BLUE}Testing Error Handling${NC}"
echo "------------------------"

# Test 14: Invalid access link
invalid_link_data='{"token":"invalid_token_123","deviceId":"test_device"}'
test_endpoint "POST" "/api/check-link" "$invalid_link_data" "400" "Invalid access link format"

# Test 15: Non-existent product
test_endpoint "GET" "/api/products/99999" "" "404" "Non-existent product"

# Test 16: Unauthorized admin access (logout first)
test_endpoint "POST" "/api/admin/logout" "" "200" "Admin logout"
test_endpoint "POST" "/api/generate-link" "$generate_link_data" "401" "Unauthorized access link generation"

echo ""
echo -e "${BLUE}Test Summary${NC}"
echo "============"

# Clean up
rm -f "$COOKIE_FILE"

echo "API testing completed!"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Start the server: npm run dev"
echo "2. Open browser: http://localhost:3000"
echo "3. Test admin panel: http://localhost:3000/admin"
echo "4. Generate access links and test the unique link system"
echo ""
echo -e "${GREEN}All core functionality has been tested!${NC}"