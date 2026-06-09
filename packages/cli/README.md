# @agent-git/cli

Agent-Git 的命令行适配包。

CLI 用于 MCP tools 不可用时的 fallback，也可供用户在终端中直接调用。它不直接实现 Git 业务逻辑，只调用 `@agent-git/core`。

## 命令

```bash
agent-git status [--workspace <path>]
agent-git save "message" [--workspace <path>]
agent-git undo [--steps <number>] [--workspace <path>]
agent-git squash "summary" [--preview] [--workspace <path>]
```

## 示例

```bash
npx -y @agent-git/cli@latest status --workspace /path/to/repo
npx -y @agent-git/cli@latest save --workspace /path/to/repo --message "准备修改订单流程"
npx -y @agent-git/cli@latest undo --workspace /path/to/repo --steps 1
npx -y @agent-git/cli@latest squash --workspace /path/to/repo --summary "feat: update order flow" --preview
```

## 参数

- `--workspace, -w`：Git 仓库路径，默认是当前目录。
- `--message, -m`：checkpoint 备注，也可以直接作为 `save` 的位置参数传入。
- `--summary, -s`：正式提交摘要，也可以直接作为 `squash` 的位置参数传入。
- `--steps`：回滚步数，默认是 `1`。
- `--preview`：只预览 squash，不创建正式提交。

## 与 MCP 的关系

如果 Agent-Git MCP tools 可用，Agent 应优先使用 MCP tools。CLI 主要用于 MCP 不可用的环境，不应在同一个工作流步骤中和 MCP 重复执行同一个动作。
