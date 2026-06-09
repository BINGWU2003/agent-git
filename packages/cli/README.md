# @agent-git/cli

Agent-Git 的命令行适配包。

CLI 是 Agent-Git Skill 工作流的运行时调用入口，也支持用户在终端中直接调用。它只负责命令解析、终端输出和调用 `@agent-git/core`，不直接实现 Git 业务逻辑。

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

## 与 Skill 和 MCP 的关系

- Skill 安装后会要求 Agent 通过本 CLI 执行 Agent-Git 工作流。
- MCP Server 是面向支持 MCP tools 的客户端的独立入口。
- CLI 和 MCP 都调用 `@agent-git/core`，二者不是主备关系；同一个工作流步骤不应通过两种入口重复执行同一个动作。
