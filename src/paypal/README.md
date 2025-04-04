# PayPal MCP Server

An MCP server implementation that integrates with official PayPal APIs, providing a secure interface for merchants to connect their agents and tools to PayPal services.

## Features

- **Payment Processing**: Create and capture PayPal orders
- **Subscription Management**: Create and cancel recurring subscriptions
- **Payout Processing**: Transfer funds to merchants and customers
- **Refund Handling**: Process refunds for completed transactions
- **Secure Identity**: AZTP integration for secure connections

## AZTP Security

This MCP server implements AZTP (Astha Zero Trust Protocol) for cryptographic identity and secure communications:

- **Cryptographic Identity**: Each server instance is assigned a unique, verifiable cryptographic identity
- **Zero Trust Architecture**: Communications are secured without relying on network boundaries or perimeter security
- **Identity Verification**: Clients can cryptographically verify they're connecting to the authentic PayPal MCP server
- **Access Control**: Fine-grained policies determine which identities can access specific tools
- **Supply Chain Security**: Helps prevent supply chain attacks by verifying the server's integrity

AZTP creates a secure ecosystem where AI agents, tools, and services can interact with confidence, making it safe to process sensitive payment operations through the PayPal API.

## Implementation Phases

The PayPal MCP server is being developed in phases:

### Phase 1: Core Payment Processing (Current)

These are the 8 essential tools implemented in the current version:

- **create_paypal_order**
  - Create a PayPal order for payment
  - Inputs:
    - `intent` (string): Payment intent ("CAPTURE" or "AUTHORIZE")
    - `purchase_units` (array): Details of items being purchased
    - `merchant_id` (string): Merchant's PayPal account ID
  - Response:
    - `orderId`: The ID of the created PayPal order
    - `status`: Order status (e.g., "CREATED")
    - `links`: PayPal HATEOAS links for further actions

- **capture_paypal_order**
  - Capture an authorized payment
  - Inputs:
    - `order_id` (string): PayPal order ID to capture
    - `merchant_id` (string): Merchant's PayPal account ID
  - Response:
    - `orderId`: The PayPal order ID
    - `status`: Updated order status (e.g., "COMPLETED")
    - `captureId`: ID of the capture transaction

- **get_order_details**
  - Get details of a specific order
  - Inputs:
    - `order_id` (string): PayPal order ID
    - `merchant_id` (string): Merchant's PayPal account ID
  - Response:
    - Full order details from PayPal API

- **create_paypal_subscription**
  - Create a subscription plan
  - Inputs:
    - `product_id` (string): PayPal product ID
    - `billing_cycles` (array): Subscription billing details
    - `merchant_id` (string): Merchant's PayPal account ID
    - `name` (string, optional): Plan name
    - `description` (string, optional): Plan description
    - `setup_fee` (object, optional): One-time setup fee
    - `subscriber_email` (string): Subscriber's email address
    - `subscriber_first_name` (string, optional): Subscriber's first name
    - `subscriber_last_name` (string, optional): Subscriber's last name
    - `brand_name` (string, optional): Merchant brand name
  - Response:
    - `subscriptionId`: ID of the created subscription
    - `planId`: ID of the created plan
    - `status`: Subscription status
    - `links`: PayPal HATEOAS links for further actions

- **cancel_subscription**
  - Cancel a subscription
  - Inputs:
    - `subscription_id` (string): PayPal subscription ID
    - `reason` (string, optional): Cancellation reason
    - `merchant_id` (string): Merchant's PayPal account ID
  - Response:
    - `subscriptionId`: The PayPal subscription ID
    - `status`: Updated subscription status
    - `message`: Confirmation message

- **create_refund**
  - Create a refund for a captured payment
  - Inputs:
    - `capture_id` (string): PayPal capture ID
    - `amount` (object, optional): Amount to refund
      - `value` (string): Amount value
      - `currency_code` (string): Currency code
    - `note` (string, optional): Note to customer
    - `merchant_id` (string): Merchant's PayPal account ID
  - Response:
    - `refundId`: ID of the created refund
    - `captureId`: The original capture ID
    - `status`: Refund status
    - `amount`: Refund amount details

- **create_paypal_payout**
  - Create a payout to transfer funds
  - Inputs:
    - `sender_batch_id` (string): Unique identifier for the payout
    - `items` (array): Recipient information and payment amounts
    - `email_subject` (string, optional): Subject line for notification email
    - `email_message` (string, optional): Message body for notification email
    - `merchant_id` (string): Merchant's PayPal account ID
  - Response:
    - `batchId`: Payout batch ID
    - `status`: Batch status
    - `links`: PayPal HATEOAS links for further actions

- **get_paypal_mcp_identity**
  - Get the AZTP identity of the PayPal MCP server
  - Used to secure connections between this server and other AZTP-enabled systems
  - No parameters required
  - Response:
    - AZTP identity string

### Phase 2: Enhanced Features (Coming Soon)

Additional tools planned for the next release:

- get_subscription_details
- get_payout_details
- get_refund_details
- activate_subscription

### Phase 3: Advanced Features (Future)

Specialized tools for advanced use cases:

- Webhook management tools
- Merchant account management
- Advanced access control

## Error Handling

All tools implement comprehensive error handling:

- Errors from PayPal API calls are caught and returned with descriptive messages
- Server errors include the original error message from PayPal
- Response includes an `isError` flag when errors occur
- Detailed logs are written to the console for debugging

## Getting Started

### Prerequisites

1. A [PayPal Developer](https://developer.paypal.com/) account
2. API credentials from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
3. An [AZTP identity](https://www.astha.ai/) for secure connections

### Integration with Claude

Add the PayPal MCP server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "paypal-mcp-server": {
      "command": "node",
      "args": ["/path/to/paypal-mcp-server/dist/index.js"],
      "env": {
        "PAYPAL_CLIENT_ID": "your_client_id_here",
        "PAYPAL_CLIENT_SECRET": "your_client_secret_here",
        "PAYPAL_ENVIRONMENT": "sandbox",
        "PAYPAL_RETURN_URL": "https://your-domain.com/return",
        "PAYPAL_CANCEL_URL": "https://your-domain.com/cancel",
        "AZTP_IDENTITY_NAME": "your_identity_name",
        "AZTP_API_KEY": "your_aztp_key",
        "AZTP_TRUST_DOMAIN": "your_domain"
      }
    }
  }
}
```

### Using with Other MCP Clients

For non-Claude MCP clients, connect using the stdio transport:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["/path/to/paypal-mcp-server/dist/index.js"],
  env: {
    // PayPal and AZTP credentials
  }
});

const client = new Client({
  name: "your-client",
  version: "1.0.0"
});

await client.connect(transport);
```

## Usage Examples

### Payment Processing

```javascript
// Create a PayPal order
const orderResult = await mcp.tools.create_paypal_order({
  intent: "CAPTURE",
  purchase_units: [
    {
      amount: {
        currency_code: "USD",
        value: "100.00"
      },
      description: "Digital product purchase"
    }
  ],
  merchant_id: "merchant123"
});

// Capture the payment
const captureResult = await mcp.tools.capture_paypal_order({
  order_id: orderResult.orderId,
  merchant_id: "merchant123"
});
```

### Subscription Management

```javascript
// Create a subscription
const subscription = await mcp.tools.create_paypal_subscription({
  product_id: "PROD-8XL72690WN23394U",
  billing_cycles: [
    {
      frequency: {
        interval_unit: "MONTH",
        interval_count: 1
      },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 12,
      pricing_scheme: {
        fixed_price: {
          value: "10.00",
          currency_code: "USD"
        }
      }
    }
  ],
  subscriber_email: "customer@example.com",
  merchant_id: "merchant123"
});
```

## Configuration

### Required Environment Variables

```bash
# PayPal API Credentials (Required)
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=sandbox|live

# PayPal Return URLs (Required for payments & subscriptions)
PAYPAL_RETURN_URL=https://your-domain.com/return
PAYPAL_CANCEL_URL=https://your-domain.com/cancel

# AZTP Configuration (Required)
AZTP_API_KEY=your_aztp_api_key
AZTP_IDENTITY_NAME=paypal-mcp-server

# AZTP Optional Settings
AZTP_TRUST_DOMAIN=optional_trust_domain
AZTP_LINK_TO=optional_link_to
AZTP_PARENT_IDENTITY=optional_parent_identity
```

## Security Considerations

- Store API credentials securely
- Use sandbox mode for testing
- Implement proper error handling
- Use HTTPS for production return URLs
- Consider implementing additional validation

## Roadmap

Future versions will include additional capabilities:
- Subscription detail retrieval
- Webhook management
- Enhanced payout operations
- Advanced reporting tools

## Support

For issues or questions:
- PayPal API: [PayPal Developer Support](https://developer.paypal.com/support/)
- MCP Integration: File an issue on the repository

## License

This project is licensed under the MIT License - see the LICENSE file for details. 