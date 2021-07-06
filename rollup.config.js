import path from 'path'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { uglify } from "rollup-plugin-uglify"
import esbuild from 'rollup-plugin-esbuild'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

const createBabelConfig = require('./babel.config')
const extensions = ['.js', '.ts', '.tsx']
const { root } = path.parse(process.cwd())

function external(id) {
  return (
    id.startsWith('./vanilla') || (!id.startsWith('.') && !id.startsWith(root)) || id.startsWith('tinycolor2') || id.startsWith('lodash')
  )
}

function getEsbuild(target) {
  return esbuild({
    minify: false,
    target,
    tsconfig: path.resolve('./tsconfig.json'),
  })
}

function getBabelOptions(targets) {
  const config = createBabelConfig({ env: (env) => env === 'build' }, targets)
  if (targets.ie) {
    config.plugins = [...config.plugins, '@babel/plugin-transform-regenerator']
    config.babelHelpers = 'bundled'
  }
  return {
    ...config,
    comments: false,
    extensions,
  }
}

function createDeclarationConfig(input, output) {
  return {
    input,
    output: {
      dir: output,
    },
    external,
    plugins: [typescript({ declaration: true, outDir: output })],
  }
}

function createESMConfig(input, output) {
  return {
    input,
    output: { file: output, format: 'esm' },
    external,
    plugins: [resolve({ extensions }), getEsbuild('node12'), sizeSnapshot()],
  }
}

function createCommonJSConfig(input, output) {
  return {
    input,
    output: { file: output, format: 'cjs', exports: 'named' },
    external,
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babel(getBabelOptions({ ie: 11 })),
      sizeSnapshot(),
    ],
  }
}

function createMinJSConfig(input, output) {
  return {
    input,
    output: { file: output, format: 'iife' },
    plugins: [
      resolve({
        extensions,
        jsnext: true,
        main: true,
        browser: true,
      }),
      commonjs(),
      babel(getBabelOptions({ ie: 11 })),
      uglify(),
    ],
  }
}

export default function (args) {
  let c = Object.keys(args).find((key) => key.startsWith('config-'))
  if (c) {
    c = c.slice('config-'.length)
    return [
      createCommonJSConfig(`src/${c}.ts`, `dist/${c}.js`),
      createMinJSConfig('src/index.ts', 'dist/index.min.js'),
      createESMConfig(`src/${c}.ts`, `dist/${c}.module.js`),
    ]
  }
  return [
    createDeclarationConfig('src/index.ts', 'dist'),
    createCommonJSConfig('src/index.ts', 'dist/index.js'),
    createMinJSConfig('src/index.ts', 'dist/index.min.js'),
    createESMConfig('src/index.ts', 'dist/index.module.js'),
  ]
}
