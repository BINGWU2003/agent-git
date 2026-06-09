import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

export const CHECKPOINT_MARKER = '[AI Checkpoint]'

export function resolveWorkspacePath(workspacePath: string): string {
  if (typeof workspacePath !== 'string' || workspacePath.trim() === '')
    throw new Error('缺少必填参数 workspacePath，请传入项目根目录路径')

  return resolve(workspacePath.trim())
}

export function git(workspacePath: string, ...args: string[]): string {
  return execFileSync('git', ['-C', workspacePath, ...args], {
    stdio: 'pipe',
    encoding: 'utf-8',
  }).trim()
}

export function gitOrEmpty(workspacePath: string, ...args: string[]): string {
  try {
    return git(workspacePath, ...args)
  }
  catch {
    return ''
  }
}

export function assertGitRepo(workspacePath: string): void {
  try {
    const result = git(workspacePath, 'rev-parse', '--is-inside-work-tree')
    if (result !== 'true')
      throw new Error('not-git-repo')
  }
  catch {
    throw new Error(`workspacePath 不是 Git 仓库: ${workspacePath}`)
  }
}

export function getChangedFiles(workspacePath: string): string[] {
  const statusRaw = git(workspacePath, 'status', '--porcelain')
  return statusRaw ? statusRaw.split('\n').filter(Boolean) : []
}

export function createCheckpointMessage(message: string, date = new Date()): string {
  return `${CHECKPOINT_MARKER} ${message.trim()} (${date.toLocaleTimeString()})`
}
