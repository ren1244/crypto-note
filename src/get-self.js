import { base64_decode, base64_encode } from './base64.js';
import { deflateSync, inflateSync } from 'fflate';

let origContentOfGetSelfMoudle = window.origContentOfGetSelfMoudle;

function codeEnc(str) {
    let data = new TextEncoder().encode(str);
    data = deflateSync(data, {level: 9});
    return base64_encode(data);
}

function codeDec(str) {
    let data = base64_decode(str);
    data = inflateSync(data);
    return new TextDecoder().decode(data);
}

async function getSelf() {
    let code = '';
    if (origContentOfGetSelfMoudle) {
        code = codeDec(origContentOfGetSelfMoudle);
    } else {
        code = await fetch(window.location.href).then(r => r.text());
    }
    code = code.replace(
        / origContentOfGetSelfMoudle\s*=window\.origContentOfGetSelfMoudle\s*;/m,
        ` origContentOfGetSelfMoudle = "${codeEnc(code)}";`
    );
    return code;
}

export default getSelf;