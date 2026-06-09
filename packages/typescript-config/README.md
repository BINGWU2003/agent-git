# @agent-git/typescript-config

Agent-Git workspace 内部使用的共享 TypeScript 配置包。

当前这个包主要承载 tsdown 打包配置。未来如果需要共享 `tsconfig`、typedoc、API extractor 或其他 TypeScript 相关配置，也应放在这里，而不是新增只面向单一工具的配置包。

## 导出

```ts
export { nodeBinConfig, nodeLibraryConfig } from '@agent-git/typescript-config/node'
```

## tsdown 配置

库包使用：

```js
export { nodeLibraryConfig as default } from '@agent-git/typescript-config/node'
```

可执行包使用：

```js
export { nodeBinConfig as default } from '@agent-git/typescript-config/node'
```

## 当前使用方

- `@agent-git/core`
- `@agent-git/mcp`
- `@agent-git/cli`
- `@agent-git/skill`

## 包边界

这个包只放共享配置，不放运行时代码，也不依赖 `@agent-git/core`。
