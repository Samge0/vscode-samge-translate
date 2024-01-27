import axios from 'axios';
import * as CryptoJS from 'crypto-js';


// tencent translate - 腾讯翻译


const endpoint = 'https://tmt.tencentcloudapi.com/';
const service = 'tmt';
const host = 'tmt.tencentcloudapi.com';
const region = 'ap-guangzhou';
const action = 'TextTranslate';
const version = '2018-03-21';


// signature function
function sign(secretKey: string, date: string, service: string, stringToSign: string) {
  const keyDate = CryptoJS.HmacSHA256(date, 'TC3' + secretKey);
  const keyService = CryptoJS.HmacSHA256(service, keyDate);
  const keySigning = CryptoJS.HmacSHA256('tc3_request', keyService);
  return CryptoJS.HmacSHA256(stringToSign, keySigning).toString(CryptoJS.enc.Hex);
}


// obtain the date format required by tencent translate
function getDate(timestamp: number) {
    const date = new Date(timestamp * 1000);
    const year = date.getUTCFullYear();
    const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
    const day = ("0" + date.getUTCDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }


// send request
export async function translateText(
    text: string, 
	providerAppId: string, 
	providerAppSecret: string, 
	languageFrom: string, 
	languageTo: string
) {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const date = getDate(timestamp);

  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = 'content-type:application/json; charset=utf-8\n' + 'host:' + host + '\n';
  const signedHeaders = 'content-type;host';
  const payload = JSON.stringify({
    SourceText: text,
    Source: languageFrom,
    Target: languageTo,
    ProjectId: 0,
  });
  const hashedRequestPayload = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
  const canonicalRequest = httpRequestMethod + '\n' + canonicalUri + '\n' + canonicalQueryString + '\n' + canonicalHeaders + '\n' + signedHeaders + '\n' + hashedRequestPayload;

  const credentialScope = date + '/' + service + '/tc3_request';
  const hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
  const stringToSign = 'TC3-HMAC-SHA256\n' + timestamp + '\n' + credentialScope + '\n' + hashedCanonicalRequest;

  const signature = sign(providerAppSecret, date, service, stringToSign);

  const authorization = 'TC3-HMAC-SHA256 Credential=' + providerAppId + '/' + credentialScope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json; charset=utf-8',
        'Host': host,
        'X-TC-Action': action,
        'X-TC-Timestamp': timestamp.toString(),
        'X-TC-Version': version,
        'X-TC-Region': region,
      }
    });

    if (!response.data.Response.Error) {
        return response.data.Response.TargetText;
    } else {
        return `【Error】error_code：${response.data.Response.Error.Code}，error_msg：$${response.data.Response.Error.Message}`;
    }

  } catch (error) {
    console.error('【Error】：', error);
    return `【Error】：${error}`;
  }
}
