import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/dom/*'],
  dts: true,
  publint: true,
  unbundle: true,
  exports: true,
})
