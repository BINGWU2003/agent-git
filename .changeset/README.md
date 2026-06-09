# Changesets

这里存放 AgentGit 可发布包的版本变更说明。

可发布包：

- `@agentgit/mcp`
- `@agentgit/cli`
- `@agentgit/skill`

内部包不发布，已在 Changesets 配置中 ignore：

- `@agentgit/core`
- `@agentgit/typescript-config`

## 常用命令

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

## npm 发布前置条件

首次发布 `@agentgit/*` scoped packages 前，需要确认：

- npm 上的 `@agentgit` scope 已归当前 npm 账号或组织所有。
- GitHub Actions 已在 npm 配置 Trusted Publisher，或仓库配置了 `NPM_TOKEN` secret。
- 可发布包的 `publishConfig.access` 必须是 `public`。

如果 CI 日志出现 `E404 Not Found - PUT https://registry.npmjs.org/@agentgit%2f...`，通常表示当前 npm 身份无权向 `@agentgit` scope 发布，或该 scope/package 的 Trusted Publisher 尚未配置完成。
