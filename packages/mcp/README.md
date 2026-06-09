# @agentgit/mcp

AgentGit 的 MCP Server 适配包。

这个包负责把 `@agentgit/core` 的能力注册为 MCP tools，并把结构化业务结果格式化为 MCP 文本响应。

## Tools

- `agentgit_status`：查看当前 Git 状态快照。
- `agentgit_save`：修改前创建 AI checkpoint。
- `agentgit_undo`：按步数回滚。
- `agentgit_squash`：预览或执行 checkpoint squash。

## 使用

```bash
npx -y @agentgit/mcp@latest
```

MCP 客户端应以 stdio server 的方式启动该命令。

## 架构边界

- MCP 层只定义 tool schema、注册 tools 和格式化响应。
- Git 操作全部通过 `@agentgit/core` 完成。
- MCP 层不直接调用 `git` 命令。
- MCP 层不复制 Skill 或 CLI 的工作流文案。

## 错误处理

所有 tool 调用会统一捕获错误，并返回 `isError: true` 的 MCP 响应。错误消息保留为面向用户的文本，方便 Agent 直接解释下一步操作。
