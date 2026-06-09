# @agent-git/skill

Agent-Git 的 Skill 安装包。

这个包负责把 Agent-Git 工作流说明安装到不同 Agent 客户端的 skills 目录中。Skill 本身只包含规则和调用约定，不包含 Git 业务逻辑。

## 安装

```bash
npx -y @agent-git/skill@latest install --target opencode
```

安装到所有支持的目标：

```bash
npx -y @agent-git/skill@latest install --target all --force
```

## 支持目标

- `opencode`：`.opencode/skills/agent-git/SKILL.md`
- `claude`：`.claude/skills/agent-git/SKILL.md`
- `codex`：`.codex/skills/agent-git/SKILL.md`
- `all`：同时安装以上所有目标。

## 运行时规则

Skill 会要求 Agent 只通过 Agent-Git CLI 执行工作流，不调用 MCP tools。

## 边界

- 不执行 Git 命令。
- 不调用 MCP SDK。
- 不复制 `@agent-git/core` 的业务逻辑。
- 只维护 Agent 可读的工作流说明和安装路径。
