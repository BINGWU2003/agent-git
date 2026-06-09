import { defineConfig } from 'tsdown'

const baseNodeConfig = {
  dts: true,
  entry: ['src/index.ts'],
  publint: true,
}

export const nodeBinConfig = defineConfig(baseNodeConfig)
export const nodeLibraryConfig = defineConfig(baseNodeConfig)
