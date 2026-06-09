import type { CheckpointCommit, StatusOptions, StatusResult } from './types.js'
import { assertGitRepo, CHECKPOINT_MARKER, getChangedFiles, git, gitOrEmpty, resolveWorkspacePath } from './git.js'

export function getContinuousCheckpoints(workspacePath: string, limit = 100): CheckpointCommit[] {
  const logOutput = gitOrEmpty(workspacePath, 'log', '--format=%h|%s', '-n', String(limit))
  const lines = logOutput.split('\n').filter(Boolean)
  const checkpoints: CheckpointCommit[] = []

  for (const line of lines) {
    const [hash = '', ...messageParts] = line.split('|')
    const message = messageParts.join('|')
    if (!message.includes(CHECKPOINT_MARKER))
      break

    checkpoints.push({ index: checkpoints.length + 1, hash, message })
  }

  return checkpoints
}

export function getStatus(options: StatusOptions): StatusResult {
  const workspacePath = resolveWorkspacePath(options.workspacePath)
  assertGitRepo(workspacePath)

  const branch = git(workspacePath, 'rev-parse', '--abbrev-ref', 'HEAD')
  const changedFiles = getChangedFiles(workspacePath)
  const checkpoints = getContinuousCheckpoints(workspacePath, options.checkpointSearchLimit)
  const recentLog = gitOrEmpty(
    workspacePath,
    'log',
    '--format=%h %s',
    '-n',
    String(options.recentCommitLimit ?? 5),
  )
  const recentCommits = recentLog.split('\n').filter(Boolean)

  return {
    workspacePath,
    branch,
    changedFiles,
    checkpointCount: checkpoints.length,
    recentCommits,
  }
}
