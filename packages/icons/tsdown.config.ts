import { defineConfig } from 'tsdown'
import solid from 'rolldown-plugin-solid'

export default defineConfig({
  entry: ['./src/index.ts'],
  plugins: [solid()],
  dts: true,
  publint: true,
  unbundle: true,
  exports: true,
  platform: 'browser' 
})
