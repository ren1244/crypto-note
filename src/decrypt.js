import { decrypt } from './aes.js';

document.querySelector('#btn-decrypt').addEventListener('click', async() => {
    let pre = document.querySelector('pre');
    let password = document.querySelector('#pwd').value;
    try{
        let plain = await decrypt(cipher, password);
        pre.textContent = plain;
    } catch(e) {
        pre.textContent = '解密錯誤';
    }
});
