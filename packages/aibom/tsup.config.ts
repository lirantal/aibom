import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entryPoints: ['src/main.ts', 'src/bin/cli.ts'],
    format: ['cjs', 'esm'],
    dts: {
      // tsup injects baseUrl while generating declarations, which TS 6 deprecates.
      compilerOptions: { ignoreDeprecations: '6.0' }
    },
    minify: false,
    outDir: 'dist/',
    clean: true,
    sourcemap: false,
    bundle: true,
    splitting: false,
    outExtension (ctx) {
      return {
        dts: '.d.ts',
        js: ctx.format === 'cjs' ? '.cjs' : '.mjs',
      }
    },
    treeshake: false,
    target: 'es2022',
    platform: 'node',
    tsconfig: './tsconfig.json',
    cjsInterop: true,
    keepNames: true,
    skipNodeModulesBundle: false,
  },

])
