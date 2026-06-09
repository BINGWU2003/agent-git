---
name: agentgit
description: Use when making code changes in a Git repository and you need AgentGit checkpoint, status, rollback, or squash workflows.
---

# AgentGit

Use this skill when editing code in a Git repository and the user has not explicitly disabled checkpointing.

AgentGit keeps Git history safe for AI coding agents by creating temporary checkpoints before edits, checking repository status, rolling back failed work, and squashing finished checkpoints into one clean commit.

## Runtime Priority

Prefer AgentGit MCP tools when they are available:

- `agentgit_status`
- `agentgit_save`
- `agentgit_undo`
- `agentgit_squash`

If MCP tools are unavailable, use the CLI fallback:

```sh
npx -y @agentgit/cli@latest status --workspace PATH
npx -y @agentgit/cli@latest save --workspace PATH --message "message"
npx -y @agentgit/cli@latest undo --workspace PATH --steps 1
npx -y @agentgit/cli@latest squash --workspace PATH --summary "summary" --preview
```

Do not run both MCP and CLI for the same workflow step after one succeeds.

## Workflow

1. Before making code changes, inspect status if useful, then create a checkpoint.
2. Make the requested edits.
3. If the edit fails, errors badly, or the user asks to revert, undo the latest checkpoint.
4. When the task or a coherent phase is complete, preview squash.
5. If the preview is correct, squash checkpoints and remaining changes into one formal commit.

## Rules

- Do not duplicate Git business logic in the skill. Use AgentGit MCP tools or the CLI fallback.
- Do not create more than one checkpoint for the same edit phase unless meaningful new changes have occurred.
- Do not run squash without a concise final summary.
- Prefer `agentgit_squash` with `preview: true` before final squash.
- Treat rollback as destructive. Only use undo when work should be discarded.
- If neither MCP nor CLI is available, explain that AgentGit runtime is unavailable and ask how to proceed.

## Message Guidance

Checkpoint messages should describe the upcoming edit:

```txt
新增 AgentGit CLI 和 Skill 适配包
```

Squash summaries should be formal commit messages:

```txt
feat: add AgentGit CLI and skill adapters
```
