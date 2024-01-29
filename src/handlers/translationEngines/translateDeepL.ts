import axios from "axios";
import CryptoJS from "crypto-js";


// deepl translate - DeepL翻译


function createSign(
  appKey: string,
  query: string,
  salt: string,
  curtime: string,
  appSecret: string
): string {
  let input =
    query.length <= 20
      ? query
      : query.substring(0, 10) +
        query.length +
        query.substring(query.length - 10);
  let strToHash = appKey + input + salt + curtime + appSecret;
  return CryptoJS.SHA256(strToHash).toString(CryptoJS.enc.Hex);
}

// for language support please refer to：
function conversionLang(value: string): string {
  return value;
}


// DeepL Free API URL
const apiUrl = "https://api-free.deepl.com/v2/translate";


// perform translation operations
export async function translateText(
  text: string,
  providerAppId: string,
  providerAppSecret: string,
  languageFrom: string,
  languageTo: string
): Promise<string> {
  try {
    const authKey = !providerAppId ? providerAppSecret : providerAppId;
    const response = await axios.post(apiUrl, null, {
      params: {
        auth_key: authKey,
        text: text,
        source_lang: languageFrom,
        target_lang: languageTo,
      },
    });

    const { translations, errorCode } = response.data;

    if (translations?.length > 0) {
        return translations[0].text;
    }

    if (errorCode) {
        return `【Error】error_code：${errorCode}, for details please refer to https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html`;
    }
    return `【Error】translation failed, please try again later`;
    
  } catch (error) {
    return `【Error】${error}`;
  }
}
