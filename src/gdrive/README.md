# Google Drive server

This MCP server integrates with Google Drive to allow listing, reading, and searching over files.

## Components

### Tools

- **search**
  - Search for files in Google Drive
  - Input: `query` (string): Search query
  - Returns file names and MIME types of matching files

### Resources

The server provides access to Google Drive files:

- **Files** (`gdrive:///<file_id>`)
  - Supports all file types
  - Google Workspace files are automatically exported:
    - Docs → Markdown
    - Sheets → CSV
    - Presentations → Plain text
    - Drawings → PNG
  - Other files are provided in their native format

## Getting started

1. [Create a new Google Cloud project](https://console.cloud.google.com/projectcreate)
2. [Enable the Google Drive API](https://console.cloud.google.com/workspace-api/products)
3. [Configure an OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) ("internal" is fine for testing)
4. Add OAuth scope `https://www.googleapis.com/auth/drive.readonly`
5. [Create an OAuth Client ID](https://console.cloud.google.com/apis/credentials/oauthclient) for application type "Desktop App"
6. Download the JSON file of your client's OAuth keys
7. Rename the key file to `gcp-oauth.keys.json` and place into the root of this repo (i.e. `servers/gcp-oauth.keys.json`)

Make sure to build the server with either `npm run build` or `npm run watch`.

### Authentication

To authenticate and save credentials:

1. Run the server with the `auth` argument: `node ./dist auth`
2. This will open an authentication flow in your system browser
3. Complete the authentication process
4. Credentials will be saved in the root of this repo (i.e. `servers/.gdrive-server-credentials.json`)

### Usage with Desktop App

To integrate this server with the desktop app, add the following to your app's server configuration:


#### NPX

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "node",
      "args": [
        "/path/to/gdrive/project/dist/index.js"
      ],
      "env": {
        "AZTP_IDENTITY_NAME": "your_aztp_identity_name_here",
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

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
