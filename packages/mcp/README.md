# @agent-git/mcp

Agent-Git 的 MCP Server 适配包。

这个包负责把 `@agent-git/core` 的能力注册为 MCP tools，并把结构化业务结果格式化为 MCP 文本响应。

## Tools

- `agent-git_status`：查看当前 Git 状态快照。
- `agent-git_save`：修改前创建 AI checkpoint。
- `agent-git_undo`：按步数回滚。
- `agent-git_squash`：预览或执行 checkpoint squash。

## 使用

### 直接启动

```bash
npx -y @agent-git/mcp@latest
```

MCP 客户端应以 stdio server 的方式启动该命令。

### MCP 客户端配置

如果客户端支持 `mcpServers` 配置，可以按下面方式接入：

```json
{
  "mcpServers": {
    "agent-git": {
      "command": "npx",
      "args": ["-y", "@agent-git/mcp@latest"]
    }
  }
}
```

如果你的客户端要求显式声明 stdio transport，可以保留同样的启动命令，并把 transport 设置为 `stdio`：

```json
{
  "mcpServers": {
    "agent-git": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@agent-git/mcp@latest"]
    }
  }
}
```

配置完成后，客户端应能看到这些 tools：

- `agent-git_status`
- `agent-git_save`
- `agent-git_undo`
- `agent-git_squash`

### workspacePath

所有 tools 都需要传入 `workspacePath`，建议使用项目根目录的绝对路径。

```json
{
  "workspacePath": "/path/to/repo"
}
```

Windows 示例：

```json
{
  "workspacePath": "D:\\files\\project"
}
```

## 架构边界

- MCP 层只定义 tool schema、注册 tools 和格式化响应。
- Git 操作全部通过 `@agent-git/core` 完成。
- MCP 层不直接调用 `git` 命令。
- MCP 层不复制 Skill 或 CLI 的工作流文案。

## 错误处理

所有 tool 调用会统一捕获错误，并返回 `isError: true` 的 MCP 响应。错误消息保留为面向用户的文本，方便 Agent 直接解释下一步操作。
