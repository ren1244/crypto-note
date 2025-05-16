import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import fs from 'fs';

(async () => {
    // 打包 index.js
    let bundle = await rollup({
        input: 'src/index.js',
        plugins: [
            nodeResolve(),
            terser({
                mangle: {
                    reserved: ['origContentOfGetSelfMoudle'],
                },
            }),
        ]
    });
    let out = await bundle.generate({
        file: 'dist/index.bundle.js',
        format: 'iife',
    });
    let code = out.output[0].code;
    await bundle.close();

    // 取得 CSS
    let css = fs.readFileSync('style.css', { encoding: 'utf-8' });

    // 取得 index.html, 插入 js
    let html = fs.readFileSync('index.html', { encoding: 'utf-8' });
    html = html.replace(
        '<script type="module" src="dist/index.bundle.js"></script>',
        `<script>${code}</script>`
    ).replace(
        '<link rel="stylesheet" href="style.css">',
        `<style>${css}</style>`
    );
    fs.writeFileSync('index2.html', html);

})();
