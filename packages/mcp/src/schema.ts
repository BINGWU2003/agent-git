import { z } from 'zod'

export const workspacePathSchema = z.string().describe('项目根目录路径（建议绝对路径）')

export const statusInputSchema = {
  workspacePath: workspacePathSchema,
}

export const saveInputSchema = {
  workspacePath: workspacePathSchema,
  message: z.string().describe('存档备注，简述接下来要修改的内容'),
}

export const undoInputSchema = {
  workspacePath: workspacePathSchema,
  steps: z.number().optional().describe('回滚步数，默认为 1（撤销最近一次修改），填 2 则撤销最近两次，以此类推'),
}

export const squashInputSchema = {
  workspacePath: workspacePathSchema,
  summary: z.string().describe('高度概括本次完成的内容，格式建议：\'feat: 重构多租户拦截器并增加表单校验\''),
  preview: z.boolean().optional().describe('是否仅预览将被合并的 Checkpoint 列表（不执行实际合并）。默认 false。建议先传 true 确认内容，再传 false 正式执行。'),
}
