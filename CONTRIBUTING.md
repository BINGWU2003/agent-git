# 贡献指南

感谢你关注 AgentGit。

AgentGit 是面向 AI 编程助手的 Git 工作流工具包，核心目标是让 checkpoint、回滚、状态查看和 squash 工作流可以被 MCP、Skill、CLI 等入口复用。

## 开发环境

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 项目结构

- `packages/core`：Git checkpoint 工作流核心逻辑。
- `packages/mcp`：MCP Server 适配器。
- `packages/cli`：CLI 适配器。
- `packages/skill`：Agent Skill 安装器和 Skill 模板。
- `packages/typescript-config`：共享 TypeScript 和 tsdown 配置。

## 代码边界

- Git 业务逻辑只能放在 `@agentgit/core`。
- MCP 层只负责 tool schema、注册和响应格式化。
- Skill 只放工作流说明，不复制 Git 业务逻辑。
- CLI 只负责参数解析和终端输出。

## 提交与发布

普通功能变更建议使用清晰的 Conventional Commit 风格，例如：

```txt
feat: add checkpoint preview
fix: handle empty repository status
docs: update skill usage
```

需要发布 npm 包时，请添加 changeset：

```bash
pnpm changeset
```

当前可发布包包括：

- `@agentgit/core`
- `@agentgit/mcp`
- `@agentgit/cli`
- `@agentgit/skill`

`@agentgit/typescript-config` 是内部配置包，不参与发布。
