import type { SquashOptions, SquashResult } from './types.js'
import { assertGitRepo, getChangedFiles, git, resolveWorkspacePath } from './git.js'
import { getContinuousCheckpoints } from './status.js'

export function squashCheckpoints(options: SquashOptions): SquashResult {
  const workspacePath = resolveWorkspacePath(options.workspacePath)
  assertGitRepo(workspacePath)

  if (typeof options.summary !== 'string' || options.summary.trim() === '')
    throw new Error('缺少必填参数 summary，请传入正式提交摘要')

  const summary = options.summary.trim()
  const preview = options.preview ?? false

  git(workspacePath, 'add', '.')
  const uncommittedFiles = getChangedFiles(workspacePath)
  const checkpoints = getContinuousCheckpoints(workspacePath)

  if (checkpoints.length === 0 && uncommittedFiles.length === 0) {
    return {
      preview,
      skipped: true,
      summary,
      checkpointCount: 0,
      checkpoints,
      uncommittedFiles,
    }
  }

  if (preview) {
    return {
      preview: true,
      skipped: false,
      summary,
      checkpointCount: checkpoints.length,
      checkpoints,
      uncommittedFiles,
    }
  }

  if (checkpoints.length > 0)
    git(workspacePath, 'reset', '--soft', `HEAD~${checkpoints.length}`)

  git(workspacePath, 'commit', '-m', summary)

  return {
    preview: false,
    skipped: false,
    summary,
    checkpointCount: checkpoints.length,
    checkpoints,
    uncommittedFiles,
    commitMessage: summary,
  }
}
