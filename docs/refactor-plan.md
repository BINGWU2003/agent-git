# AgentGit 重构迁移方案

## 背景

当前项目 `aig-mcp-server` 的核心能力是为 AI 编程助手提供 Git checkpoint 工作流，包括状态查看、临时存档、回滚和提交压缩。

但现有项目名和包名都强绑定 `MCP Server`，无法准确表达产品定位。未来能力也不应只服务 MCP，而应抽象为可被 MCP、Skill、CLI 或 SDK 复用的 Git 业务层。

因此，本次重构目标不是在旧项目中继续扩展，而是以当前代码为基础，迁移到新的 monorepo 项目。

## 目标

- 新项目使用更清晰的产品名：`AgentGit`。
- 废弃旧 npm 包：`aig-mcp-server`。
- 将业务逻辑从 MCP 协议中抽离出来。
- 建立 `core + adapters` 的 monorepo 架构。
- 让同一套 Git 业务能力可供 MCP、Skill、CLI 等入口复用。
- 降低未来扩展成本，避免继续被旧项目名和旧包结构限制。

## 推荐命名

### 项目名

```txt
AgentGit
```

### 仓库名

```txt
agentgit
```

### npm scope

```txt
@agentgit
```

### 包名

```txt
@agentgit/core
@agentgit/mcp
@agentgit/skill
@agentgit/cli
```

`@agentgit/cli` 可以暂不实现，但建议在架构上预留。

## 新项目架构

```txt
agentgit/
  packages/
    core/
      package.json
      src/
        index.ts
        git.ts
        status.ts
        save.ts
        undo.ts
        squash.ts
        types.ts

    mcp/
      package.json
      src/
        index.ts
        tools.ts
        schema.ts
        format.ts

    skill/
      package.json
      src/
        index.ts
        instructions.ts
        workflows.ts

    cli/
      package.json
      src/
        index.ts

  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  README.md
```

## 包职责

### `@agentgit/core`

核心业务包，只负责 Git 工作流逻辑。

职责：

- 解析和校验 `workspacePath`。
- 检查 Git 仓库状态。
- 获取当前分支、工作区变更、最近提交。
- 创建 AI checkpoint。
- 统计连续 checkpoint。
- 回滚 checkpoint。
- 将 checkpoint 和未提交变更压缩为正式 commit。

禁止事项：

- 不依赖 `@modelcontextprotocol/sdk`。
- 不返回 MCP 的 `CallToolResult`。
- 不定义 MCP tool schema。
- 不包含 skill 文案或编辑器规则。

建议返回结构化业务结果，例如：

```ts
export interface SaveResult {
  skipped: boolean
  message: string
  commitMessage?: string
}

export interface StatusResult {
  branch: string
  changedFiles: string[]
  checkpointCount: number
  recentCommits: string[]
}
```

### `@agentgit/mcp`

MCP 适配包，只负责把 core 能力注册为 MCP tools。

职责：

- 创建 MCP server。
- 注册 `agentgit_status`、`agentgit_save`、`agentgit_undo`、`agentgit_squash` 等工具。
- 定义 MCP input schema。
- 调用 `@agentgit/core`。
- 将 core 的结构化结果格式化为 MCP `CallToolResult`。
- 包装错误信息。

禁止事项：

- 不直接实现 Git 业务逻辑。
- 不直接调用 `git` 命令，除非是 MCP 层特有的诊断需求。

### `@agentgit/skill`

Skill 适配包，负责为不同 Agent 平台提供工作流规则和调用约定。

职责：

- 生成 AgentGit 工作流说明。
- 描述何时调用 save、status、undo、squash。
- 输出适用于不同编辑器或 Agent 的规则文本。
- 如有需要，可调用 `@agentgit/core` 提供本地能力。

禁止事项：

- 不复制 MCP tool 逻辑。
- 不复制 core 中的 Git 操作逻辑。

### `@agentgit/cli`

命令行入口，后续可选实现。

职责：

- 提供 `agentgit status`。
- 提供 `agentgit save "message"`。
- 提供 `agentgit undo --steps 1`。
- 提供 `agentgit squash "summary" --preview`。

## 当前代码迁移映射

| 当前文件 | 新位置 | 说明 |
| --- | --- | --- |
| `src/utils/git.ts` | `packages/core/src/git.ts` | 保留 Git 命令封装和 workspacePath 处理 |
| `src/tools/aig_status.ts` | `packages/core/src/status.ts` + `packages/mcp/src/tools.ts` | 业务逻辑进 core，MCP schema 和格式化进 mcp |
| `src/tools/aig_save.ts` | `packages/core/src/save.ts` + `packages/mcp/src/tools.ts` | 同上 |
| `src/tools/aig_undo.ts` | `packages/core/src/undo.ts` + `packages/mcp/src/tools.ts` | 同上 |
| `src/tools/aig_squash.ts` | `packages/core/src/squash.ts` + `packages/mcp/src/tools.ts` | 同上 |
| `src/types.ts` | 拆分到 `packages/core/src/types.ts` 和 `packages/mcp/src/types.ts` | core 类型和 MCP 类型分离 |
| `src/index.ts` | `packages/mcp/src/index.ts` | 只保留 MCP server 启动逻辑 |

## 工具命名建议

旧工具名：

```txt
aig_status
aig_save
aig_undo
aig_squash
```

新工具名建议：

```txt
agentgit_status
agentgit_save
agentgit_undo
agentgit_squash
```

如果希望更短，也可以使用：

```txt
git_status
git_savepoint
git_undo
git_squash
```

推荐使用 `agentgit_*`，因为它能避免和其他 Git MCP 工具冲突，也能强化产品名。

## 迁移步骤

### 阶段 1：创建新项目

1. 新建仓库 `agentgit`。
2. 初始化 pnpm monorepo。
3. 添加基础配置：`pnpm-workspace.yaml`、`tsconfig.base.json`、根 `package.json`。
4. 创建 `packages/core` 和 `packages/mcp`。
5. 暂时不创建或不实现 `packages/skill`、`packages/cli`，但在 README 中说明规划。

### 阶段 2：迁移 core

1. 将 `src/utils/git.ts` 迁移到 `packages/core/src/git.ts`。
2. 将 `aig_status` 的业务逻辑迁移到 `packages/core/src/status.ts`。
3. 将 `aig_save` 的业务逻辑迁移到 `packages/core/src/save.ts`。
4. 将 `aig_undo` 的业务逻辑迁移到 `packages/core/src/undo.ts`。
5. 将 `aig_squash` 的业务逻辑迁移到 `packages/core/src/squash.ts`。
6. 移除 core 中所有 MCP 类型依赖。
7. 为 core 增加结构化返回类型。

### 阶段 3：实现 MCP adapter

1. 在 `packages/mcp` 中安装 `@modelcontextprotocol/sdk` 和 `zod`。
2. 实现 MCP server 启动入口。
3. 定义 MCP tool schema。
4. 注册 `agentgit_*` 工具。
5. 调用 `@agentgit/core` 对应函数。
6. 将 core 返回值格式化为 MCP 文本结果。
7. 保留统一错误处理。

### 阶段 4：实现 Skill adapter

1. 创建 `packages/skill`。
2. 输出 AgentGit 工作流规则。
3. 支持不同平台的规则模板，例如 Claude、Cursor、OpenCode。
4. 如果 skill 需要执行本地 Git 能力，则通过 `@agentgit/core` 调用。

### 阶段 5：处理旧包

1. 在旧项目 `aig-mcp-server` README 顶部加入废弃说明。
2. 指向新项目 `AgentGit` 和新包 `@agentgit/mcp`。
3. 可选：发布最后一个版本，例如 `1.5.0`。
4. 执行 npm deprecate。

```bash
npm deprecate aig-mcp-server "Deprecated. Please use @agentgit/mcp instead."
```

5. 旧仓库可设置为 archived，或保留只读状态。

## 旧包废弃 README 示例

```md
# aig-mcp-server is deprecated

This package has been deprecated.

Please use AgentGit instead:

```bash
npm install @agentgit/mcp
```

New project:

```txt
https://github.com/<owner>/agentgit
```

AgentGit is the successor to `aig-mcp-server`. It provides a reusable Git workflow core for AI coding agents, with adapters for MCP, skills, and future CLI usage.
```

## 新 README 定位文案

```md
# AgentGit

Git workflow toolkit for AI coding agents.

AgentGit helps AI coding assistants manage Git history safely with checkpoints, rollback, status snapshots, and commit squashing.

It provides a reusable core package and adapters for MCP, skills, and future CLI usage.
```

## 设计原则

- core 优先，adapter 其次。
- 业务逻辑只写一次。
- 协议相关代码只能存在于对应 adapter 中。
- 包名、工具名和 README 都应围绕 `AgentGit`，不再围绕 `MCP Server`。
- 旧包只做废弃和迁移说明，不继续承载新能力。
- 如果没有明确兼容需求，不为旧 `aig_*` 工具名增加兼容层。

## 推荐的最小首版范围

首版不需要一次性实现所有包。建议先完成：

```txt
@agentgit/core
@agentgit/mcp
```

首版能力：

- `agentgit_status`
- `agentgit_save`
- `agentgit_undo`
- `agentgit_squash`

后续再补：

```txt
@agentgit/skill
@agentgit/cli
```

## 风险点

### npm scope 可用性

`@agentgit` 可能已被占用。迁移前需要确认 npm scope 是否可注册。

如果不可用，可备选：

```txt
@agent-git
@git-agent-kit
@aig-dev
```

### 工具名变化

废弃旧包后，用户需要从 `aig_*` 工具名切换到 `agentgit_*`。

如果用户量很小，可以直接切换，不做兼容。

如果用户量较大，可以在 `@agentgit/mcp` 中短期保留别名工具，但明确标注 deprecated。

### Git destructive 操作

当前 `aig_undo` 使用 `git reset --hard`。迁移到 core 后应重新审视该行为是否需要更强的保护。

建议后续考虑：

- 只允许回滚连续的 AgentGit checkpoint。
- 回滚前检测是否存在非 checkpoint 提交。
- 提供 preview 模式。
- 对 untracked files 做更明确的说明。

## 最终结论

建议新建 `AgentGit` 项目，并以当前 `aig-mcp-server` 代码作为迁移基础。

旧项目不再继续重构，只保留为 legacy package，发布废弃说明并指向新项目。

新项目采用 monorepo 架构，以 `@agentgit/core` 为业务核心，`@agentgit/mcp` 和 `@agentgit/skill` 作为适配层。
