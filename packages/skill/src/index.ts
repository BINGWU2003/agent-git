#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

type SkillTarget = 'all' | 'claude' | 'codex' | 'opencode'

const SKILL_TARGETS = ['opencode', 'claude', 'codex'] as const

interface InstallOptions {
  force: boolean
  target: SkillTarget
}

export async function run(argv = process.argv.slice(2)): Promise<void> {
  const [command, ...args] = argv

  if (!command || command === '--help' || command === '-h') {
    printHelp()
    return
  }

  switch (command) {
    case 'install':
      await installSkill(parseInstallArgs(args))
      break
    default:
      throw new Error(`Unknown command: ${command}`)
  }
}

export async function installSkill(options: InstallOptions): Promise<void> {
  if (options.target === 'all') {
    for (const target of SKILL_TARGETS)
      await installSkillFile(target, options.force)

    return
  }

  await installSkillFile(options.target, options.force)
}

function parseInstallArgs(args: string[]): InstallOptions {
  const options: InstallOptions = { force: false, target: 'opencode' }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--force') {
      options.force = true
      continue
    }

    if (arg === '--target') {
      options.target = parseSkillTarget(readOptionValue(args, index, arg))
      index += 1
      continue
    }

    throw new Error(`Unknown install option: ${arg}`)
  }

  return options
}

async function installSkillFile(target: Exclude<SkillTarget, 'all'>, force: boolean): Promise<void> {
  const source = getSkillTemplatePath()
  const destination = getSkillFilePath(target)

  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, await readFile(source, 'utf8'), {
    encoding: 'utf8',
    flag: force ? 'w' : 'wx',
  })

  writeLine(`Installed ${target} skill: ${destination}`)
}

function getSkillTemplatePath(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'agentgit', 'SKILL.md')
}

function getSkillFilePath(target: Exclude<SkillTarget, 'all'>): string {
  return resolve(process.cwd(), `.${target}`, 'skills', 'agentgit', 'SKILL.md')
}

function parseSkillTarget(value: string): SkillTarget {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'all' || normalized === 'claude' || normalized === 'codex' || normalized === 'opencode')
    return normalized

  throw new Error('Target must be one of: opencode, claude, codex, all')
}

function readOptionValue(args: string[], index: number, option: string): string {
  const value = args[index + 1]
  if (!value)
    throw new Error(`Missing value for ${option}`)

  return value
}

function printHelp(): void {
  writeLine(`AgentGit Skill

Usage:
  agentgit-skill install [--target opencode|claude|codex|all] [--force]

The skill installs workflow instructions only. Git operations are still executed through AgentGit MCP tools or the AgentGit CLI fallback.
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
