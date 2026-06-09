import type { SaveResult, SquashResult, StatusResult, UndoResult } from '@agentgit/core'
import type { CallToolResult } from './types.js'

export function textResult(text: string): CallToolResult {
  return { content: [{ type: 'text' as const, text }] }
}

export function formatStatus(result: StatusResult): string {
  const workingTreeStatus = result.changedFiles.length === 0
    ? '工作区干净，无未提交变更'
    : `有 ${result.changedFiles.length} 个文件未提交：\n${result.changedFiles.map(file => `  ${file}`).join('\n')}`

  const checkpointStatus = result.checkpointCount === 0
    ? '无待合并的 AI Checkpoint'
    : `有 ${result.checkpointCount} 个连续 AI Checkpoint 待合并（可调用 agentgit_squash 压缩）`

  const recentCommits = result.recentCommits.length > 0
    ? result.recentCommits.map((line, index) => `  ${index + 1}. ${line}`).join('\n')
    : '  （暂无提交）'

  return [
    `当前分支：${result.branch}`,
    '',
    workingTreeStatus,
    '',
    checkpointStatus,
    '',
    '最近提交记录：',
    recentCommits,
  ].join('\n')
}

export function formatSave(result: SaveResult): string {
  return result.message
}

export function formatUndo(result: UndoResult): string {
  return result.message
}

export function formatSquash(result: SquashResult): string {
  if (result.skipped)
    return '没有找到 AI Checkpoint，工作区也无未提交变更。当前 Git 历史已经很整洁了！'

  if (result.preview) {
    const lines: string[] = [
      '预览：以下内容将被压缩合并为：',
      `   "${result.summary}"`,
      '',
    ]

    if (result.checkpoints.length > 0) {
      lines.push(
        `${result.checkpointCount} 个 AI Checkpoint：`,
        ...result.checkpoints.map(checkpoint => `  ${checkpoint.index}. ${checkpoint.hash} ${checkpoint.message}`),
      )
    }

    if (result.uncommittedFiles.length > 0) {
      lines.push(
        '',
        `${result.uncommittedFiles.length} 个未提交变更（将一并纳入）：`,
        ...result.uncommittedFiles.map(file => `  ${file}`),
      )
    }

    lines.push('', '确认无误后，请以 preview: false 重新调用 agentgit_squash 执行合并。')
    return lines.join('\n')
  }

  const parts: string[] = []
  if (result.checkpointCount > 0)
    parts.push(`${result.checkpointCount} 个 AI Checkpoint`)
  if (result.uncommittedFiles.length > 0)
    parts.push(`${result.uncommittedFiles.length} 个未提交变更`)

  return `完美收官！已将 ${parts.join(' + ')} 合并为 1 个正式提交：\n"${result.commitMessage ?? result.summary}"`
}
