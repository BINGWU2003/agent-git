# Changesets

这里存放 Agent-Git 可发布包的版本变更说明。

可发布包：

- `@agent-git/mcp`
- `@agent-git/cli`
- `@agent-git/skill`

内部包不发布，已在 Changesets 配置中 ignore：

- `@agent-git/core`
- `@agent-git/typescript-config`

## 常用命令

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

## npm 发布前置条件

首次发布 `@agent-git/*` scoped packages 前，需要确认：

- npm 上的 `@agent-git` scope 已归当前 npm 账号或组织所有。
- GitHub Actions 已在 npm 配置 Trusted Publisher，或仓库配置了 `NPM_TOKEN` secret。
- 可发布包的 `publishConfig.access` 必须是 `public`。

如果 CI 日志出现 `E404 Not Found - PUT https://registry.npmjs.org/@agent-git%2f...`，通常表示当前 npm 身份无权向 `@agent-git` scope 发布，或该 scope/package 的 Trusted Publisher 尚未配置完成。
