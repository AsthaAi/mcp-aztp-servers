#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import {
  BedrockAgentRuntimeClient,
  RetrieveCommand,
  RetrieveCommandInput,
} from "@aws-sdk/client-bedrock-agent-runtime";
import aztp from "aztp-client";

// AWS client initialization
const bedrockClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface RAGSource {
  id: string;
  fileName: string;
  snippet: string;
  score: number;
}

async function retrieveContext(
  query: string,
  knowledgeBaseId: string,
  n: number = 3
): Promise<{
  context: string;
  isRagWorking: boolean;
  ragSources: RAGSource[];
}> {
  try {
    if (!knowledgeBaseId) {
      console.error("knowledgeBaseId is not provided");
      return {
        context: "",
        isRagWorking: false,
        ragSources: [],
      };
    }

    const input: RetrieveCommandInput = {
      knowledgeBaseId: knowledgeBaseId,
      retrievalQuery: { text: query },
      retrievalConfiguration: {
        vectorSearchConfiguration: { numberOfResults: n },
      },
    };

    const command = new RetrieveCommand(input);
    const response = await bedrockClient.send(command);
    const rawResults = response?.retrievalResults || [];
    const ragSources: RAGSource[] = rawResults
      .filter((res) => res?.content?.text)
      .map((result, index) => {
        const uri = result?.location?.s3Location?.uri || "";
        const fileName = uri.split("/").pop() || `Source-${index}.txt`;
        return {
          id: (result.metadata?.["x-amz-bedrock-kb-chunk-id"] as string) || `chunk-${index}`,
          fileName: fileName.replace(/_/g, " ").replace(".txt", ""),
          snippet: result.content?.text || "",
          score: (result.score as number) || 0,
        };
      })
      .slice(0, 3);

    const context = rawResults
      .filter((res): res is { content: { text: string } } => res?.content?.text !== undefined)
      .map(res => res.content.text)
      .join("\n\n");

    return {
      context,
      isRagWorking: true,
      ragSources,
    };
  } catch (error) {
    console.error("RAG Error:", error);
    return { context: "", isRagWorking: false, ragSources: [] };
  }
}

// Define the retrieval tool
const RETRIEVAL_TOOL: Tool = {
  name: "retrieve_from_aws_kb",
  description: "Performs retrieval from the AWS Knowledge Base using the provided query and Knowledge Base ID.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The query to perform retrieval on" },
      knowledgeBaseId: { type: "string", description: "The ID of the AWS Knowledge Base" },
      n: { type: "number", default: 3, description: "Number of results to retrieve" },
    },
    required: ["query", "knowledgeBaseId"],
  },
};

// Define the identity tool
const GET_IDENTITY_TOOL: Tool = {
  name: "get_aws_kb_retrieval_server_aztp_identity",
  description: "Get AZTP identity of the AWS KB retrieval server. This is used to secure the connection between this server and other AZTP servers.",
  inputSchema: {
    type: "object",
    properties: {
      random_string: { type: "string", description: "Dummy parameter for no-parameter tools" },
    },
    required: ["random_string"],
  },
};

// Server setup
const server = new Server(
  {
    name: "aws-kb-retrieval-server",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const aztpApiKey = process.env.AZTP_API_KEY;
if (!aztpApiKey) throw new Error("AZTP_API_KEY is required");

// Initialize the AZTP client
const aztpClient = aztp.default.initialize({
  apiKey: aztpApiKey,
});

const mcpName = process.env.AZTP_IDENTITY_NAME as string;
if (!mcpName) throw new Error("AZTP_IDENTITY_NAME is required");

const linkTo = process.env.AZTP_LINK_TO as string | null;
const parentIdentity = process.env.AZTP_PARENT_IDENTITY as string | null;
const trustDomain = process.env.AZTP_TRUST_DOMAIN as string | null;

interface MetadataType {
  isGlobalIdentity: boolean;
  trustDomain?: string;
  linkTo?: string[];
  parentIdentity?: string;
}

// Request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [RETRIEVAL_TOOL, GET_IDENTITY_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "retrieve_from_aws_kb") {
    const { query, knowledgeBaseId, n = 3 } = args as Record<string, any>;
    try {
      const result = await retrieveContext(query, knowledgeBaseId, n);
      if (result.isRagWorking) {
        return {
          content: [
            { type: "text", text: `Context: ${result.context}` },
            { type: "text", text: `RAG Sources: ${JSON.stringify(result.ragSources)}` },
          ],
        };
      } else {
        return {
          content: [{ type: "text", text: "Retrieval failed or returned no results." }],
        };
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error occurred: ${error}` }],
      };
    }
  } else if (name === "get_aws_kb_retrieval_server_aztp_identity") {
    try {
      if (!securedAgent) {
        return {
          content: [{ type: "text", text: "Server identity not yet established" }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: securedAgent.identity.aztpId }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error retrieving server identity: ${error}` }],
        isError: true,
      };
    }
  } else {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }
});

// Server startup
let securedAgent: Awaited<ReturnType<typeof aztpClient.secureConnect>> | null = null;

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AWS KB Retrieval Server running on stdio");

  const metadata: MetadataType = {
    isGlobalIdentity: false
  };

  if (trustDomain) { metadata.trustDomain = trustDomain; }

  if (linkTo) { metadata.linkTo = [linkTo]; }

  if (parentIdentity) { metadata.parentIdentity = parentIdentity; }

  const securedAgent = await aztpClient.secureConnect(server, mcpName, metadata);

  console.error("AZTP secured connection to AWS KB Retrieval Server");

  if (!securedAgent.identity.verify) {
    throw new Error("Invalid identity");
  }
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
