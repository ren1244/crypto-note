import { base64_decode, base64_encode } from './base64.js';
import { deflateSync, inflateSync } from 'fflate';

/**
 * @typedef {Object} Cipher
 * @property {string}  data cipher in base64
 * @property {string}  iv   iv in base64
 * @property {string}  salt salt in base64
 * @property {boolean} comp is compressed
 * @property {string}  alg  algorithm
 */

const tEnc = new TextEncoder();
const tDec = new TextDecoder();
const algorithm = 'PBKDF2-HMAC-SHA512 (1000 iterations, with salt) -> AES-256-GCM (128-bit tag, no AAD)';

/**
 * @param {string} password 
 * @param {Uint8Array} salt
 * @returns {Promise.<CryptoKey>}
 */
async function getKey(password, salt) {
    let pwd = tEnc.encode(password);
    let origKey = await window.crypto.subtle.importKey('raw', pwd, 'PBKDF2', false, ['deriveKey']);
    return await window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', hash: 'SHA-512', salt, iterations: 1000 },
        origKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * 加密文字
 * @param {string} text 明文
 * @param {string} password 密碼
 * @returns {Promise.<Cipher>}
 */
async function encrypt(text, password) {
    let salt = new Uint8Array(16);
    let iv = new Uint8Array(12);
    window.crypto.getRandomValues(salt);
    window.crypto.getRandomValues(iv);
    let key = await getKey(password, salt);
    let data = tEnc.encode(text);
    let compressData = deflateSync(data, { level: 9 });
    let compressed = compressData.length < data.length;
    let cipher = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        compressed ? compressData : data
    );
    return {
        alg: algorithm,
        comp: compressed,
        iv: base64_encode(iv),
        salt: base64_encode(salt),
        data: base64_encode(cipher),
    };
}

/**
 * @param {Cipher} cipherObject 
 * @param {string} password 密碼
 * @returns {Promise.<string>} 明文
 */
async function decrypt(cipherObject, password) {
    let cipher = base64_decode(cipherObject.data);
    let iv = base64_decode(cipherObject.iv);
    let salt = base64_decode(cipherObject.salt);
    let compressed = cipherObject.comp;
    let key = await getKey(password, salt);
    let data = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        cipher
    );
    if (compressed) {
        data = inflateSync(new Uint8Array(data));
    }
    return tDec.decode(data);
}

export { encrypt, decrypt };
