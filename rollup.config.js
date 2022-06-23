import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';
import json from 'rollup-plugin-json';
// import sass from 'rollup-plugin-sass'
// import autoprefixer from 'autoprefixer'
// import postcss from 'postcss'

const packageJson = require('./package.json');

Object.assign(packageJson, {
  main: 'release/dist/index.js',
  module: 'release/dist/index.es.js',
  types: 'release/dist/index.d.ts',
});

export default [
  {
    input: 'temp/index.js',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      json(),
      excludeDependenciesFromBundle(),
      resolve({
        extensions: ['.js', '.jsx', '.json'],
      }),
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: [['@babel/plugin-transform-runtime', { helpers: true, regenerator: true }]],
      }),
    ],
  },
  {
    input: 'temp/index.d.ts',
    output: [{ file: packageJson.types, format: 'es' }],
    plugins: [excludeDependenciesFromBundle(), dts()],
  },
];
