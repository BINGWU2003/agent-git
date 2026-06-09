#!/usr/bin/env node
import { resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { tools } from './tools.js'

export function createServer(): McpServer {
  const server = new McpServer(
    { name: '@agent-git/mcp', version: '0.0.0' },
    { capabilities: { tools: {} } },
  )

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args) => {
        try {
          return tool.handler((args ?? {}) as Record<string, unknown>)
        }
        catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          return {
            content: [{ type: 'text' as const, text: `失败: ${message}` }],
            isError: true,
          }
        }
      },
    )
  }

  return server
}

export async function startServer(): Promise<void> {
  const transport = new StdioServerTransport()
  await createServer().connect(transport)
}

const entryPath = process.argv[1]
if (entryPath && pathToFileURL(resolve(entryPath)).href === import.meta.url) {
  startServer().catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
    process.exit(1)
  })
}
