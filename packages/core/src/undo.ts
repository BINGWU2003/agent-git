import type { UndoOptions, UndoResult } from './types.js'
import { assertGitRepo, git, resolveWorkspacePath } from './git.js'

export function undoCheckpoints(options: UndoOptions): UndoResult {
  const workspacePath = resolveWorkspacePath(options.workspacePath)
  assertGitRepo(workspacePath)
  const steps = options.steps ?? 1

  if (!Number.isInteger(steps) || steps < 1 || steps > 20)
    throw new Error('steps 参数无效，请传入 1~20 之间的整数。')

  git(workspacePath, 'reset', '--hard', `HEAD~${steps}`)

  return {
    steps,
    message: `已回滚 ${steps} 步！所有相关修改已撤销。`,
  }
}
