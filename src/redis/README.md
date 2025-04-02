# Redis

A Model Context Protocol server that provides access to Redis databases. This server enables LLMs to interact with Redis key-value stores through a set of standardized tools.

## Components

### Tools

- **set**
  - Set a Redis key-value pair with optional expiration
  - Input:
    - `key` (string): Redis key
    - `value` (string): Value to store
    - `expireSeconds` (number, optional): Expiration time in seconds

- **get**
  - Get value by key from Redis
  - Input: `key` (string): Redis key to retrieve

- **delete**
  - Delete one or more keys from Redis
  - Input: `key` (string | string[]): Key or array of keys to delete

- **list**
  - List Redis keys matching a pattern
  - Input: `pattern` (string, optional): Pattern to match keys (default: *)

## Usage with Claude Desktop

To use this server with the Claude Desktop app, add the following configuration to the "mcpServers" section of your `claude_desktop_config.json`:

### NPX

```json
{
  "mcpServers": {
    "redis": {
      "command": "node",
      "args": [
        "/path/to/redis/project/build/index.js",
        "redis://localhost:6379"
      ],
      "env": {
        "AZTP_IDENTITY_NAME": "your_key_here",
        "AZTP_API_KEY": "your_key_here",
        "AZTP_LINK_TO": ["aztp_link_here", "aztp_link_here"],
        "AZTP_PARENT_IDENTITY": "aztp_link_here",
        "AZTP_TRUST_DOMAIN": "your_domain_here"
      }
    }
  }
}
```

## Where to Get an AZTP API Key

1. Register at [https://www.astha.ai/](https://www.astha.ai/)
2. Generate your API key
3. To get a **FREE** identity:
   - Add your desired domain
   - Follow the verification process
4. Set your domain as the default
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.