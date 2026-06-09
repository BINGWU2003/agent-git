import type { McpTool } from './types.js'
import { getStatus, saveCheckpoint, squashCheckpoints, undoCheckpoints } from '@agent-git/core'
import { formatSave, formatSquash, formatStatus, formatUndo, textResult } from './format.js'
import { saveInputSchema, squashInputSchema, statusInputSchema, undoInputSchema } from './schema.js'

function getStringArg(args: Record<string, unknown>, name: string): string {
  const value = args[name]
  if (typeof value !== 'string')
    throw new Error(`缺少必填参数 ${name}`)
  return value
}

function getOptionalNumberArg(args: Record<string, unknown>, name: string): number | undefined {
  const value = args[name]
  if (value === undefined)
    return undefined
  if (typeof value !== 'number')
    throw new Error(`${name} 参数必须是数字`)
  return value
}

function getOptionalBooleanArg(args: Record<string, unknown>, name: string): boolean | undefined {
  const value = args[name]
  if (value === undefined)
    return undefined
  if (typeof value !== 'boolean')
    throw new Error(`${name} 参数必须是布尔值`)
  return value
}

export const tools: McpTool[] = [
  {
    name: 'agent-git_status',
    description: '查看当前 Git 状态快照：分支、工作区变更、待合并的 AI Checkpoint 数量及最近提交记录。在执行 agent-git_save / agent-git_squash 前调用，可帮助 AI 了解当前状态。',
    inputSchema: statusInputSchema,
    handler(args) {
      return textResult(formatStatus(getStatus({ workspacePath: getStringArg(args, 'workspacePath') })))
    },
  },
  {
    name: 'agent-git_save',
    description: '在进行代码修改前，强制调用此工具进行 Git 碎片存档（Checkpoint）。',
    inputSchema: saveInputSchema,
    handler(args) {
      return textResult(formatSave(saveCheckpoint({
        workspacePath: getStringArg(args, 'workspacePath'),
        message: getStringArg(args, 'message'),
      })))
    },
  },
  {
    name: 'agent-git_undo',
    description: '代码修改失败、报错，或用户要求撤销时，调用此工具将代码回滚。支持多步回滚。',
    inputSchema: undoInputSchema,
    handler(args) {
      return textResult(formatUndo(undoCheckpoints({
        workspacePath: getStringArg(args, 'workspacePath'),
        steps: getOptionalNumberArg(args, 'steps'),
      })))
    },
  },
  {
    name: 'agent-git_squash',
    description: '当整个需求或一个阶段的任务全部完成后，调用此工具。它会自动识别并把之前产生的所有连续 AI Checkpoint 碎片提交，以及当前工作区未提交的变更，一起压缩合并成一个正式的、整洁的 Git 提交记录。建议先用 preview: true 预览，确认后再正式执行。',
    inputSchema: squashInputSchema,
    handler(args) {
      return textResult(formatSquash(squashCheckpoints({
        workspacePath: getStringArg(args, 'workspacePath'),
        summary: getStringArg(args, 'summary'),
        preview: getOptionalBooleanArg(args, 'preview'),
      })))
    },
  },
]
