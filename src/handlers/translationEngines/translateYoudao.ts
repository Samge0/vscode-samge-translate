import axios from 'axios';
import CryptoJS from 'crypto-js';


// youdao translate - 有道翻译


function createSign(appKey: string, query: string, salt: string, curtime: string, appSecret: string): string {
  let input = query.length <= 20 ? query : query.substring(0, 10) + query.length + query.substring(query.length - 10);
  let strToHash = appKey + input + salt + curtime + appSecret;
  return CryptoJS.SHA256(strToHash).toString(CryptoJS.enc.Hex);
}


// for language support please refer to：https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html#section-9
function conversionLang(value: string): string {
    if ("zh" === value) {
        return "zh-CHS";
    }
    return value;
}


// perform translation operations
export async function translateText(
	text: string, 
	providerAppId: string, 
	providerAppSecret: string, 
	languageFrom: string, 
	languageTo: string
): Promise<string> {

  languageFrom = conversionLang(languageFrom);
  languageTo = conversionLang(languageTo);

  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const curtime = Math.floor(Date.now() / 1000).toString();
  const sign = createSign(providerAppId, text, salt, curtime, providerAppSecret);

  const params = {
    q: text,
    from: languageFrom,
    to: languageTo,
    appKey: providerAppId,
    salt: salt,
    sign: sign,
    signType: 'v3',
    curtime: curtime
  };

  try {
    const response = await axios.post('https://openapi.youdao.com/api', null, { params });

    const { translation, errorCode } = response.data;

    if (translation?.length > 0) {
        return translation[0];
    }

    if (errorCode) {
        return `【Error】error_code：${errorCode}, for details please refer to https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html`;
    }
    return `【Error】translation failed, please try again later`;

  } catch (error) {
    return `【Error】${error}`;
  }
}
