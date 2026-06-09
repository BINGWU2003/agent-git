import type { SaveOptions, SaveResult } from './types.js'
import { assertGitRepo, createCheckpointMessage, getChangedFiles, git, resolveWorkspacePath } from './git.js'

export function saveCheckpoint(options: SaveOptions): SaveResult {
  const workspacePath = resolveWorkspacePath(options.workspacePath)
  assertGitRepo(workspacePath)

  if (typeof options.message !== 'string' || options.message.trim() === '')
    throw new Error('缺少必填参数 message，请传入存档备注')

  git(workspacePath, 'add', '.')

  const changedFiles = getChangedFiles(workspacePath)
  if (changedFiles.length === 0) {
    return {
      skipped: true,
      message: '工作区无任何变更，跳过本次存档，请先修改代码再存档。',
      changedFiles,
    }
  }

  const commitMessage = createCheckpointMessage(options.message)
  git(workspacePath, 'commit', '-m', commitMessage)

  return {
    skipped: false,
    message: `存档成功！记录: ${commitMessage}`,
    commitMessage,
    changedFiles,
  }
}
