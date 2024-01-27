import axios from 'axios';
import qs from 'qs';
import md5 from 'md5';


// perform translation operations
export async function translateText(
	text: string, 
	providerAppId: string, 
	providerAppSecret: string, 
	languageFrom: string, 
	languageTo: string
): Promise<string> {
    const salt = (new Date).getTime();
    const sign = md5(providerAppId + text + salt + providerAppSecret);

    const params = {
        q: text,
        from: languageFrom,
        to: languageTo,
        appid: providerAppId,
        salt: salt,
        sign: sign
    };

    try {
        console.log(qs.stringify(params));
        const response = await axios.post('https://fanyi-api.baidu.com/api/trans/vip/translate', qs.stringify(params));
        if (!response.data.error_code) {
            return response.data.trans_result[0].dst;
        } else {
            return `【Error】error_code：${response.data.error_code}，error_msg：${response.data.error_msg}`;
        }
    } catch (error) {
        return `【Error】${error}`;
    }
    
}
