import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const mode = process.env.MODE ?? 'prod';
const isProd = mode === "prod";

export default [
  {
    input: `./src/index.ts`,
    output:
      {
        file: "./build/es/index.js",
        format: "es",
        sourcemap: !isProd
      },
    plugins: [
      resolve(), commonjs(), typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: !isProd,
            declarationDir: "build/es"
          }, include: ["src"]
        }
      })]
  }, {
    input: `./src/index.ts`,
    output: [
      {
        file: "./build/cjs/index.cjs",
        exports: "named",
        format: "cjs",
        sourcemap: !isProd
      },
    ],
    plugins: [
      resolve(), commonjs(), typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: !isProd,
            declarationDir: "build/cjs"
          }, include: ["src"]
        }
      })],
  },
  {
    input: `./src/index.ts`,
    output: [
      {
        file: "./build/umd/index.global.js",
        name: 'webgalParser',
        format: 'iife',
        sourcemap: !isProd
      },
    ],
    plugins: [
      resolve(), commonjs(), typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: !isProd,
            declarationDir: "build/types"
          }, include: ["src"]
        }
      })],
  }
];
