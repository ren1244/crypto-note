import * as aes from './aes.js';
import { getApp, getPayload } from 'html-itself';

function clearInput() {
    document.querySelector('#pwd').value = '';
    document.querySelector('#pwd2').value = '';
    document.querySelector('#pwd3').value = '';
    document.querySelector('#file').value = null;
}

function openPopup(panelId) {
    clearInput();
    let popup = document.querySelector('#popup');
    popup.querySelectorAll('.panel').forEach(ele => {
        ele.classList.toggle('hide', panelId !== ele.id);
    });
    popup.classList.toggle('hide', false);
}

function closePopup() {
    let popup = document.querySelector('#popup');
    popup.classList.toggle('hide', true);
}

let proc = 'save';

document.querySelector('#btn-archive').addEventListener('click', () => {
    proc = 'archive';
    openPopup('panel1');
});

document.querySelector('#btn-save').addEventListener('click', () => {
    proc = 'save';
    openPopup('panel1');
});

document.querySelector('#btn-load').addEventListener('click', () => {
    openPopup('panel2');
});

function downloadFile(filename, data, mime) {
    let url = URL.createObjectURL(new Blob([data], { type: mime }));
    let tTag = document.createElement('a');
    tTag.href = url;
    tTag.download = filename;
    tTag.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
}

// 點選加密按鈕
document.querySelector('#btn-encrypt').addEventListener('click', async () => {
    let text = document.querySelector('#text').value;
    let pwd = document.querySelector('#pwd').value;
    let pwd2 = document.querySelector('#pwd2').value;
    if (pwd.length < 4) {
        alert('密碼至少四位');
        return;
    }
    if (pwd !== pwd2) {
        alert('兩次輸入的密碼不同');
        return;
    }
    try {
        let cipher = await aes.encrypt(text, pwd);
        switch (proc) {
            case 'archive':
                getApp(cipher, 'cipher.html');
                break;
            case 'save':
                downloadFile('cipher.json', JSON.stringify(cipher), 'application/json');
                break;
            default:
                throw 'bad proc';
        }
        closePopup();
    } catch (e) {
        alert('發生錯誤：' + e);
    }
});

// 點選解密按鈕
document.querySelector('#btn-decrypt').addEventListener('click', async () => {
    try {
        let pwd = document.querySelector('#pwd3').value;
        let file = document.querySelector('#file').files[0];
        let fileContent = await new Promise(resolve => {
            let frd = new FileReader();
            frd.onload = () => {
                resolve(frd.result);
            };
            frd.readAsText(file);
        });
        let cipherJson = JSON.parse(fileContent);
        let text = await aes.decrypt(cipherJson, pwd);
        document.querySelector('#text').value = text;
    } catch (e) {
        console.log(e);
        document.querySelector('#text').value = '解密錯誤';
    }
    closePopup();
});

document.querySelectorAll('.cancel').forEach(ele => {
    ele.addEventListener('click', () => {
        closePopup();
    });
});

if(getPayload()) {
    openPopup('panel3');
}

// 點選解密按鈕
document.querySelector('#btn-decrypt2').addEventListener('click', async () => {
    try {
        let pwd = document.querySelector('#pwd4').value;
        let cipherJson = getPayload();
        let text = await aes.decrypt(cipherJson, pwd);
        document.querySelector('#text').value = text;
        closePopup();
    } catch (e) {
        document.querySelector('#dec-log').textContent = '解密錯誤';
        console.log(e);
    }
});