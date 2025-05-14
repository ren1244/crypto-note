import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import fs from 'fs';

(async () => {
    // 取得打包的 decrypt.js
    let bundle = await rollup({
        input: 'src/decrypt.js',
        plugins: [
            nodeResolve(),
            terser(),
        ]
    });
    let output = await bundle.generate({
        file: 'dist/test.js',
        format: 'iife'
    });
    let decryptCode = output.output[0].code;
    await bundle.close();

    // 讀取 decrypt.html，插入 decryptCode
    let htmlCode = fs.readFileSync('decrypt.html', { encoding: 'utf-8' });
    htmlCode = htmlCode.replace('/** src/decrypt.js */', decryptCode);

    // 打包 index.js，過程中插入 htmlCode
    bundle = await rollup({
        input: 'src/index.js',
        plugins: [
            nodeResolve(),
            //terser(),
            {
                transform(code, id) {
                    if (id.search(/index\.js$/) > -1) {
                        return {
                            id,
                            code: code.replace(
                                'const htmlTemplate = "";',
                                `const htmlTemplate = ${JSON.stringify(htmlCode)};`
                            )
                        };
                    }
                }
            }
        ]
    });
    await bundle.write({
        file: 'dist/index.bundle.js',
        format: 'iife',
    });
    await bundle.close();
})();
