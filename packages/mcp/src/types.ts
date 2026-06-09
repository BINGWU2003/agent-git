import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { z } from 'zod'

export type { CallToolResult }

export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, z.ZodType>
  handler: (args: Record<string, unknown>) => CallToolResult
}
