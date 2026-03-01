import { defineConfig } from 'tsdown';
import solid from 'rolldown-plugin-solid';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  dts: true,
  platform: 'browser',
  plugins: [
    solid()
  ]
});
