export interface WorkspaceOptions {
  workspacePath: string
}

export interface CheckpointCommit {
  index: number
  hash: string
  message: string
}

export interface StatusOptions extends WorkspaceOptions {
  checkpointSearchLimit?: number
  recentCommitLimit?: number
}

export interface StatusResult {
  workspacePath: string
  branch: string
  changedFiles: string[]
  checkpointCount: number
  recentCommits: string[]
}

export interface SaveOptions extends WorkspaceOptions {
  message: string
}

export interface SaveResult {
  skipped: boolean
  message: string
  commitMessage?: string
  changedFiles: string[]
}

export interface UndoOptions extends WorkspaceOptions {
  steps?: number
}

export interface UndoResult {
  steps: number
  message: string
}

export interface SquashOptions extends WorkspaceOptions {
  summary: string
  preview?: boolean
}

export interface SquashResult {
  preview: boolean
  skipped: boolean
  summary: string
  checkpointCount: number
  checkpoints: CheckpointCommit[]
  uncommittedFiles: string[]
  commitMessage?: string
}
