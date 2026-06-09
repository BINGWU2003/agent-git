# AgentGit

Git workflow toolkit for AI coding agents.

AgentGit helps AI coding assistants manage Git history safely with checkpoints, rollback, status snapshots, and commit squashing.

It provides a reusable core package and adapters for MCP, CLI, and installable agent skills.

## Packages

| Package | Purpose |
| --- | --- |
| `@agentgit/core` | Git checkpoint workflow business logic. |
| `@agentgit/mcp` | MCP server adapter exposing `agentgit_*` tools. |
| `@agentgit/cli` | Command-line adapter that calls `@agentgit/core`. |
| `@agentgit/skill` | Installable skill instructions for AgentGit workflows. |

## MCP Tools

`@agentgit/mcp` exposes these tools:

- `agentgit_status`
- `agentgit_save`
- `agentgit_undo`
- `agentgit_squash`

## CLI

```bash
npx -y @agentgit/cli@latest status --workspace /path/to/repo
npx -y @agentgit/cli@latest save --workspace /path/to/repo --message "prepare refactor"
npx -y @agentgit/cli@latest undo --workspace /path/to/repo --steps 1
npx -y @agentgit/cli@latest squash --workspace /path/to/repo --summary "feat: add checkout flow" --preview
```

The CLI is a fallback adapter. It does not implement Git business logic directly; it calls `@agentgit/core`.

## Skill

Install AgentGit workflow instructions into an agent client:

```bash
npx -y @agentgit/skill@latest install --target opencode
npx -y @agentgit/skill@latest install --target all --force
```

Supported targets:

- `opencode` -> `.opencode/skills/agentgit/SKILL.md`
- `claude` -> `.claude/skills/agentgit/SKILL.md`
- `codex` -> `.codex/skills/agentgit/SKILL.md`

The skill only describes workflow rules. Runtime operations should use AgentGit MCP tools first, then the CLI fallback if MCP tools are unavailable.

## Architecture

AgentGit follows a `core + adapters` architecture:

- `core` owns Git commands, workspace validation, checkpoint detection, rollback, and squash behavior.
- `mcp` owns MCP schemas, tool registration, result formatting, and error wrapping.
- `cli` owns command parsing and terminal output.
- `skill` owns installable Markdown instructions and platform-specific placement.

Adapters must not duplicate Git business logic from `core`.

## Development

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm run build
```

## License

[MIT](./LICENSE) License
