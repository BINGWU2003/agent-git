# Agent-Git

面向 AI 编程助手的 Git 工作流工具包。

Agent-Git 帮助 AI 编程助手在修改代码时安全管理 Git 历史：修改前创建临时 checkpoint，失败时回滚，完成后把多个 checkpoint 和未提交变更压缩成一个整洁的正式提交。

项目采用 `core + adapters` 架构。Git 业务逻辑只存在于 `@agent-git/core`；MCP 和 CLI 是运行时入口适配层，Skill 是可安装的 Agent 工作流说明。

## 包列表

| 包 | 职责 |
| --- | --- |
| `@agent-git/core` | Git checkpoint 工作流的核心业务逻辑。 |
| `@agent-git/mcp` | MCP Server 适配器，面向支持 MCP tools 的 Agent 客户端。 |
| `@agent-git/cli` | 命令行适配器，供 Skill 工作流和终端直接调用。 |
| `@agent-git/skill` | 可安装的 Agent-Git Skill 工作流说明，指引 Agent 通过 CLI 调用。 |
| `@agent-git/typescript-config` | 共享 TypeScript、tsdown 等 TS 相关配置。 |

## MCP Tools

`@agent-git/mcp` 提供以下工具：

- `agent-git_status`：查看分支、工作区变更、连续 checkpoint 数量和最近提交。
- `agent-git_save`：在修改前创建 AI checkpoint。
- `agent-git_undo`：回滚最近的 checkpoint 或提交步数。
- `agent-git_squash`：把连续 checkpoint 和未提交变更压缩为正式 commit。

## CLI

```bash
npx -y @agent-git/cli@latest status --workspace /path/to/repo
npx -y @agent-git/cli@latest save --workspace /path/to/repo --message "准备重构"
npx -y @agent-git/cli@latest undo --workspace /path/to/repo --steps 1
npx -y @agent-git/cli@latest squash --workspace /path/to/repo --summary "feat: add checkout flow" --preview
```

CLI 是 Agent-Git Skill 工作流的运行时调用入口，也支持用户在终端中直接调用。它不直接实现 Git 业务逻辑，只调用 `@agent-git/core`。

## Skill

安装 Agent-Git 工作流说明到 Agent 客户端：

```bash
npx -y @agent-git/skill@latest install --target opencode
npx -y @agent-git/skill@latest install --target all --force
```

支持的安装目标：

- `opencode` -> `.opencode/skills/agent-git/SKILL.md`
- `claude` -> `.claude/skills/agent-git/SKILL.md`
- `codex` -> `.codex/skills/agent-git/SKILL.md`

Skill 只描述工作流规则。运行时通过 Agent-Git CLI 执行，不调用 MCP tools。

## 架构原则

- `core` 负责 Git 命令、workspace 校验、checkpoint 识别、回滚和 squash 行为。
- `mcp` 负责 MCP schema、tool 注册、结果格式化和错误包装，面向支持 MCP tools 的客户端。
- `cli` 负责命令解析和终端输出，供 Skill 工作流和终端直接调用。
- `skill` 负责可安装的 Markdown 工作流说明和不同 Agent 客户端的安装路径，运行时指引 Agent 调用 CLI。
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

可发布包包括 `@agent-git/mcp`、`@agent-git/cli` 和 `@agent-git/skill`。

内部包不参与发布：

- `@agent-git/core`：内部业务核心，构建时会被打进 `mcp` 和 `cli` 产物。
- `@agent-git/typescript-config`：内部配置包。

## 许可证

[MIT](./LICENSE) 许可证
