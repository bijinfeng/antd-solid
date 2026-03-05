import { defineConfig } from 'tsdown'
import solid from 'rolldown-plugin-solid'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  plugins: [solid()],
  dts: true,
  publint: true,
  unbundle: true,
  platform: 'browser',
})
