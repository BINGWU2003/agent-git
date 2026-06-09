---
name: agentgit
description: 在 Git 仓库中修改代码时使用 AgentGit checkpoint、状态查看、回滚和 squash 工作流。
---

# AgentGit

当你在 Git 仓库中修改代码，且用户没有明确禁用 checkpoint 工作流时，使用本 Skill。

AgentGit 通过以下方式帮助 AI 编程助手安全管理 Git 历史：修改前创建临时 checkpoint，必要时查看仓库状态，失败时回滚，完成后把多个 checkpoint 和未提交变更压缩成一个整洁的正式提交。

## 运行方式

本 Skill 只允许通过 AgentGit CLI 执行 Git 工作流，不要调用 MCP tools。

使用方式：

```sh
npx -y @agentgit/cli@latest status --workspace PATH
npx -y @agentgit/cli@latest save --workspace PATH --message "准备修改代码"
npx -y @agentgit/cli@latest undo --workspace PATH --steps 1
npx -y @agentgit/cli@latest squash --workspace PATH --summary "feat: 完成某项能力" --preview
```

`PATH` 必须是 Git 仓库根目录路径，优先使用绝对路径。

## 禁止事项

- 不要调用 `agentgit_status`、`agentgit_save`、`agentgit_undo`、`agentgit_squash` 等 MCP tools。
- 不要混用 MCP 和 CLI，同一个工作流只能通过 CLI 执行。
- 不要手写 Git 命令替代 AgentGit CLI，除非用户明确要求绕过 AgentGit。

## 工作流

1. 修改代码前，如有必要先查看状态，然后创建 checkpoint。
2. 执行用户要求的代码修改。
3. 如果修改失败、出现严重错误，或用户要求撤销，回滚最近的 checkpoint。
4. 当整个任务或一个清晰阶段完成后，先预览 squash。
5. 如果预览内容正确，再把 checkpoint 和剩余变更压缩成一个正式 commit。

## 规则

- 不要在 Skill 中复制 Git 业务逻辑，必须通过 AgentGit CLI 执行。
- 同一个编辑阶段不要重复创建多个 checkpoint，除非已经产生新的、有意义的变更。
- 不要在缺少清晰提交摘要时执行 squash。
- 正式 squash 前，必须先执行 `agentgit squash --preview` 预览。
- 回滚是破坏性操作，只在确实要丢弃修改时使用 undo。
- 如果 CLI 不可用，说明 AgentGit CLI 不可用，并询问用户下一步怎么处理。

## 消息建议

checkpoint message 应描述“接下来要做什么”：

```txt
新增 AgentGit CLI 和 Skill 适配包
```

squash summary 应使用正式 commit message：

```txt
feat: add AgentGit CLI and skill adapters
```
