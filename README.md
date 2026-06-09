# AgentGit

面向 AI 编程助手的 Git 工作流工具包。

AgentGit 帮助 AI 编程助手在修改代码时安全管理 Git 历史：修改前创建临时 checkpoint，失败时回滚，完成后把多个 checkpoint 和未提交变更压缩成一个整洁的正式提交。

项目采用 `core + adapters` 架构。Git 业务逻辑只存在于 `@agentgit/core`，MCP、CLI 和 Skill 都只是入口适配层。

## 包列表

| 包 | 职责 |
| --- | --- |
| `@agentgit/core` | Git checkpoint 工作流的核心业务逻辑。 |
| `@agentgit/mcp` | MCP Server 适配器，暴露 `agentgit_*` tools。 |
| `@agentgit/cli` | 命令行适配器，调用 `@agentgit/core`。 |
| `@agentgit/skill` | 可安装的 AgentGit Skill 工作流说明。 |
| `@agentgit/typescript-config` | 共享 TypeScript、tsdown 等 TS 相关配置。 |

## MCP Tools

`@agentgit/mcp` 提供以下工具：

- `agentgit_status`：查看分支、工作区变更、连续 checkpoint 数量和最近提交。
- `agentgit_save`：在修改前创建 AI checkpoint。
- `agentgit_undo`：回滚最近的 checkpoint 或提交步数。
- `agentgit_squash`：把连续 checkpoint 和未提交变更压缩为正式 commit。

## CLI

```bash
npx -y @agentgit/cli@latest status --workspace /path/to/repo
npx -y @agentgit/cli@latest save --workspace /path/to/repo --message "准备重构"
npx -y @agentgit/cli@latest undo --workspace /path/to/repo --steps 1
npx -y @agentgit/cli@latest squash --workspace /path/to/repo --summary "feat: add checkout flow" --preview
```

CLI 是 MCP 不可用时的备用入口。它不直接实现 Git 业务逻辑，只调用 `@agentgit/core`。

## Skill

安装 AgentGit 工作流说明到 Agent 客户端：

```bash
npx -y @agentgit/skill@latest install --target opencode
npx -y @agentgit/skill@latest install --target all --force
```

支持的安装目标：

- `opencode` -> `.opencode/skills/agentgit/SKILL.md`
- `claude` -> `.claude/skills/agentgit/SKILL.md`
- `codex` -> `.codex/skills/agentgit/SKILL.md`

Skill 只描述工作流规则。运行时应优先使用 AgentGit MCP tools；如果 MCP tools 不可用，再使用 CLI 作为 fallback。

## 架构原则

- `core` 负责 Git 命令、workspace 校验、checkpoint 识别、回滚和 squash 行为。
- `mcp` 负责 MCP schema、tool 注册、结果格式化和错误包装。
- `cli` 负责命令解析和终端输出。
- `skill` 负责可安装的 Markdown 工作流说明和不同 Agent 客户端的安装路径。
- `typescript-config` 负责共享 TypeScript 相关配置，目前包含 tsdown 打包配置。

适配层不能复制 `core` 的 Git 业务逻辑。

## 开发

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm run build
```

`build` 和 `dev` 由 Turborepo 编排，包产物会按 package 依赖关系增量构建并缓存。

## 发布

项目使用 Changesets 管理版本和发布：

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

可发布包包括 `@agentgit/core`、`@agentgit/mcp`、`@agentgit/cli` 和 `@agentgit/skill`。`@agentgit/typescript-config` 是内部配置包，不参与发布。

## 许可证

[MIT](./LICENSE) 许可证
