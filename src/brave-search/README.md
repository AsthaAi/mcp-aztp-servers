# Brave Search MCP Server

An MCP server implementation that integrates the Brave Search API, providing both web and local search capabilities.

## Features

- **Web Search**: General queries, news, articles, with pagination and freshness controls
- **Local Search**: Find businesses, restaurants, and services with detailed information
- **Flexible Filtering**: Control result types, safety levels, and content freshness
- **Smart Fallbacks**: Local search automatically falls back to web when no results are found

## Tools

- **brave_web_search**

  - Execute web searches with pagination and filtering
  - Inputs:
    - `query` (string): Search terms
    - `count` (number, optional): Results per page (max 20)
    - `offset` (number, optional): Pagination offset (max 9)

- **brave_local_search**
  - Search for local businesses and services
  - Inputs:
    - `query` (string): Local search terms
    - `count` (number, optional): Number of results (max 20)
  - Automatically falls back to web search if no local results found

- **get_brave_search_aztp_identity**
  - Get AZTP identity of the Brave Search MCP server. This is used to secure the connection between the Brave Search MCP server and the AZTP server.

## Configuration

### Getting an API Key

1. Sign up for a [Brave Search API account](https://brave.com/search/api/)
2. Choose a plan (Free tier available with 2,000 queries/month)
3. Generate your API key [from the developer dashboard](https://api.search.brave.com/app/keys)

## Where to Get an AZTP API Key

1. Register at [https://www.astha.ai/](https://www.astha.ai/)
2. Generate your API key
3. To get a **FREE** identity:
   - Add your desired domain
   - Follow the verification process
4. Set your domain as the default

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

### NPX

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "node",
      "args": ["/path/to/brave-search/project/dist/index.js"],
      "env": {
        "BRAVE_API_KEY": "your_api_key_here",
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


## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

