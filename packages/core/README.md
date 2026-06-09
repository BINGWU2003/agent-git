# @agent-git/core

Agent-Git 的核心业务包，负责 Git checkpoint 工作流逻辑。

这个包是 workspace 内部包，不单独发布到 npm。它不依赖 MCP SDK，不定义 MCP schema，也不输出 Agent Skill 文案。它只提供可复用的 TypeScript API，供 MCP、CLI、Skill fallback 或未来 SDK 入口调用。

## 职责

- 解析并校验 `workspacePath`。
- 检查目标路径是否为 Git 仓库。
- 获取当前分支、工作区变更和最近提交。
- 创建 AI checkpoint。
- 统计连续 AI checkpoint。
- 回滚指定步数。
- 将连续 checkpoint 和未提交变更压缩为正式 commit。

## API

```ts
import {
  getStatus,
  saveCheckpoint,
  squashCheckpoints,
  undoCheckpoints,
} from '@agent-git/core'
```

### `getStatus(options)`

返回仓库状态快照，包括分支、变更文件、连续 checkpoint 数量和最近提交。

```ts
const status = getStatus({ workspacePath: '/path/to/repo' })
```

### `saveCheckpoint(options)`

执行 `git add .` 并创建 `[AI Checkpoint]` 提交。如果工作区无变更，会返回 `skipped: true`。

```ts
const result = saveCheckpoint({
  workspacePath: '/path/to/repo',
  message: '准备重构登录流程',
})
```

### `undoCheckpoints(options)`

执行指定步数的回滚。当前实现使用 `git reset --hard`，调用方应只在明确需要丢弃修改时使用。

```ts
undoCheckpoints({ workspacePath: '/path/to/repo', steps: 1 })
```

### `squashCheckpoints(options)`

识别最近连续的 AI checkpoint，并可选择预览或执行 squash。

```ts
const preview = squashCheckpoints({
  workspacePath: '/path/to/repo',
  summary: 'feat: add login flow',
  preview: true,
})
```

## 边界

- 不返回 MCP `CallToolResult`。
- 不负责命令行参数解析。
- 不负责 Agent 平台的规则文案。
- 不做 `aig_*` 旧工具名兼容。
