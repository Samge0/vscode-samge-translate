import CryptoJS from 'crypto-js';


// encryption key, currently mainly used to encrypt cache values
const secretKey = "S20240128Spmh17iLUuTy332wsR45oFG";


export function encryptData(value: string): string {
    if (!value) {
        return "";
    }
    try {
        const key = CryptoJS.enc.Utf8.parse(secretKey);
        const srcs = CryptoJS.enc.Utf8.parse(value);
        const encrypted = CryptoJS.AES.encrypt(srcs, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7});
        return encrypted.toString();
    } catch (error) {
        console.log(`【Error】encryptData ${error}`);
        return "";
    }    
}
 

export function decryptData(value: string): string {
    if (!value) {
        return "";
    }
    try {
        const key = CryptoJS.enc.Utf8.parse(secretKey);
        const decrypt = CryptoJS.AES.decrypt(value, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7});
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    } catch (error) {
        console.log(`【Error】decryptData ${error}`);
        return "";
    }    
}

