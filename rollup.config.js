import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.bundle.js',
            format: 'iife'
        },
        plugins: [
            nodeResolve(),
            terser()
        ]
    }
];
