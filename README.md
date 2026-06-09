# AgentGit

Git workflow toolkit for AI coding agents.

AgentGit helps AI coding assistants manage Git history safely with checkpoints, rollback, status snapshots, and commit squashing.

It provides a reusable core package and adapters for MCP, skills, and future CLI usage.

## Packages

| Package | Purpose |
| --- | --- |
| `@agentgit/core` | Git checkpoint workflow business logic. |
| `@agentgit/mcp` | MCP server adapter exposing `agentgit_*` tools. |

Planned packages: `@agentgit/skill` and `@agentgit/cli`.

## MCP Tools

`@agentgit/mcp` exposes these tools:

- `agentgit_status`
- `agentgit_save`
- `agentgit_undo`
- `agentgit_squash`

## Development

```bash
pnpm install
pnpm run build
pnpm run typecheck
```

## License

[MIT](./LICENSE) License
