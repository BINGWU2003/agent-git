#!/usr/bin/env node
import { resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { getStatus, saveCheckpoint, squashCheckpoints, undoCheckpoints } from '@agentgit/core'

interface ParsedArgs {
  command?: string
  values: string[]
  workspacePath: string
  message?: string
  summary?: string
  steps?: number
  preview: boolean
  help: boolean
}

export async function run(argv = process.argv.slice(2)): Promise<void> {
  const args = parseArgs(argv)

  if (args.help || !args.command) {
    printHelp()
    return
  }

  switch (args.command) {
    case 'status':
      writeLine(formatStatus(getStatus({ workspacePath: args.workspacePath })))
      break
    case 'save':
      writeLine(saveCheckpoint({
        workspacePath: args.workspacePath,
        message: args.message ?? args.values.join(' '),
      }).message)
      break
    case 'undo':
      writeLine(undoCheckpoints({
        workspacePath: args.workspacePath,
        steps: args.steps,
      }).message)
      break
    case 'squash':
      writeLine(formatSquash(squashCheckpoints({
        workspacePath: args.workspacePath,
        summary: args.summary ?? args.values.join(' '),
        preview: args.preview,
      })))
      break
    default:
      throw new Error(`Unknown command: ${args.command}`)
  }
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv
  const parsed: ParsedArgs = {
    command,
    values: [],
    workspacePath: process.cwd(),
    preview: false,
    help: command === '--help' || command === '-h',
  }

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]

    if (arg === '--help' || arg === '-h') {
      parsed.help = true
      continue
    }

    if (arg === '--workspace' || arg === '-w') {
      parsed.workspacePath = readOptionValue(rest, index, arg)
      index += 1
      continue
    }

    if (arg === '--message' || arg === '-m') {
      parsed.message = readOptionValue(rest, index, arg)
      index += 1
      continue
    }

    if (arg === '--summary' || arg === '-s') {
      parsed.summary = readOptionValue(rest, index, arg)
      index += 1
      continue
    }

    if (arg === '--steps') {
      parsed.steps = Number(readOptionValue(rest, index, arg))
      index += 1
      continue
    }

    if (arg === '--preview') {
      parsed.preview = true
      continue
    }

    parsed.values.push(arg)
  }

  return parsed
}

function readOptionValue(args: string[], index: number, option: string): string {
  const value = args[index + 1]
  if (!value)
    throw new Error(`Missing value for ${option}`)

  return value
}

function formatStatus(result: ReturnType<typeof getStatus>): string {
  const workingTreeStatus = result.changedFiles.length === 0
    ? '工作区干净，无未提交变更'
    : `有 ${result.changedFiles.length} 个文件未提交：\n${result.changedFiles.map(file => `  ${file}`).join('\n')}`

  const checkpointStatus = result.checkpointCount === 0
    ? '无待合并的 AI Checkpoint'
    : `有 ${result.checkpointCount} 个连续 AI Checkpoint 待合并（可执行 agentgit squash 压缩）`

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

function formatSquash(result: ReturnType<typeof squashCheckpoints>): string {
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

    lines.push('', '确认无误后，请执行 agentgit squash --summary "..." 完成合并。')
    return lines.join('\n')
  }

  const parts: string[] = []
  if (result.checkpointCount > 0)
    parts.push(`${result.checkpointCount} 个 AI Checkpoint`)
  if (result.uncommittedFiles.length > 0)
    parts.push(`${result.uncommittedFiles.length} 个未提交变更`)

  return `已将 ${parts.join(' + ')} 合并为 1 个正式提交：\n"${result.commitMessage ?? result.summary}"`
}

function printHelp(): void {
  writeLine(`AgentGit CLI

Usage:
  agentgit status [--workspace <path>]
  agentgit save "message" [--workspace <path>]
  agentgit undo [--steps <number>] [--workspace <path>]
  agentgit squash "summary" [--preview] [--workspace <path>]

Options:
  -w, --workspace <path>  Git workspace path. Defaults to the current directory.
  -m, --message <text>    Checkpoint message for save.
  -s, --summary <text>    Final commit summary for squash.
      --steps <number>    Undo steps. Defaults to 1.
      --preview           Preview squash without committing.
`)
}

function writeLine(message: string): void {
  process.stdout.write(`${message}\n`)
}

const entryPath = process.argv[1]
if (entryPath && pathToFileURL(resolve(entryPath)).href === import.meta.url) {
  run().catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
    process.exitCode = 1
  })
}
