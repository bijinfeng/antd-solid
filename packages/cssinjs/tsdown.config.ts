import { defineConfig } from 'tsdown';
import solid from 'rolldown-plugin-solid';

export default defineConfig({
  entry: ['./src/index.ts'],
  clean: true,
  dts: true,
  exports: true,
  plugins: [
    solid()
  ]
});
