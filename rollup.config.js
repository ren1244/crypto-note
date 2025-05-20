import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import htmlItself from "html-itself/rollup";
import fs from 'fs';
import { base64_encode } from './src/base64.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 取得目前這個檔案的目錄
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function base64svg(filename) {
    let data = fs.readFileSync(filename, { encoding: 'utf-8' });
    data = new TextEncoder().encode(data);
    data = base64_encode(data);
    return 'data:image/svg+xml;base64,' + data;
}

export default {
    input: 'src/index.js',
    output: {
        format: 'iife'
    },
    plugins: [
        nodeResolve(),
        terser(),
        htmlItself({
            template() {
                let html = fs.readFileSync('src/index-template.html', { encoding: 'utf-8' });

                // 取得 CSS
                let css = fs.readFileSync(path.join(__dirname, './src/style.css'), { encoding: 'utf-8' });

                html = html.replace(
                    '<link rel="stylesheet" href="style.css">',
                    `<style>${css}</style>`
                ).replace(
                    '../icon/file-archive.svg',
                    base64svg(path.join(__dirname, './icon/file-archive.svg'))
                ).replace(
                    '../icon/file-lock-2.svg',
                    base64svg(path.join(__dirname, './icon/file-lock-2.svg'))
                ).replace(
                    '../icon/file-key-2.svg',
                    base64svg(path.join(__dirname, './icon/file-key-2.svg'))
                );

                return html.split('<script type="module" src="./index.js"></script>');
            },
            target: 'index.html',
            payloadInit: null
        })
    ]
};