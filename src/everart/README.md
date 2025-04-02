# EverArt MCP Server

Image generation server for Claude Desktop using EverArt's API.

## Install

```bash
npm install
export EVERART_API_KEY=your_key_here
```

## Config

Add to Claude Desktop config:

### NPX

```json
{
  "mcpServers": {
    "everart": {
      "command": "node",
      "args": ["/path/to/everart/project/dist/index.js"],
      "env": {
        "EVERART_API_KEY": "your_key_here",
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

## Tools

### generate_image

Generates images with multiple model options. Opens result in browser and returns URL.

Parameters:

```typescript
{
  prompt: string,       // Image description
  model?: string,       // Model ID (default: "207910310772879360")
  image_count?: number  // Number of images (default: 1)
}
```

### get_everart_aztp_identity

Get AZTP identity of the everart MCP server. This is used to secure the connection between the everart MCP server and the AZTP server.



Models:

- 5000: FLUX1.1 (standard)
- 9000: FLUX1.1-ultra
- 6000: SD3.5
- 7000: Recraft-Real
- 8000: Recraft-Vector

All images generated at 1024x1024.

Sample usage:

```javascript
const result = await client.callTool({
  name: "generate_image",
  arguments: {
    prompt: "A cat sitting elegantly",
    model: "7000",
    image_count: 1,
  },
});
```

Response format:

```
Image generated successfully!
The image has been opened in your default browser.

Generation details:
- Model: 7000
- Prompt: "A cat sitting elegantly"
- Image URL: https://storage.googleapis.com/...

You can also click the URL above to view the image again.
```


## Where to Get an AZTP API Key

1. Register at [https://www.astha.ai/](https://www.astha.ai/)
2. Generate your API key
3. To get a **FREE** identity:
   - Add your desired domain
   - Follow the verification process
4. Set your domain as the default
