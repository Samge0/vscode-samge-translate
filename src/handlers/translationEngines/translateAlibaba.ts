import alimt20181012, * as $alimt20181012 from '@alicloud/alimt20181012';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';


// Alibaba translate - 阿里翻译


/**
   * initialize account client using accessKeyId accessKeySecret
   * @param accessKeyId
   * @param accessKeySecret
   * @return Client
   * @throws Exception
   */
export function createClient(accessKeyId: string, accessKeySecret: string): alimt20181012 {
  let config = new $OpenApi.Config({
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
  });
  // Endpoint please refer to https://api.aliyun.com/product/alimt
  config.endpoint = `mt.cn-hangzhou.aliyuncs.com`;
  return new alimt20181012(config);
}


export async function translateText(
	text: string, 
	providerAppId: string, 
	providerAppSecret: string, 
	languageFrom: string, 
	languageTo: string
): Promise<string> {
  let client = createClient(providerAppId, providerAppSecret);
  let translateGeneralRequest = new $alimt20181012.TranslateGeneralRequest({
    formatType: 'text',
    scene: 'general',
    sourceLanguage: languageFrom,
    sourceText: text,
    targetLanguage: languageTo
    });
  let runtime = new $Util.RuntimeOptions({ });
  try {
    const response = await client.translateGeneralWithOptions(translateGeneralRequest, runtime);
    return response.body.data?.translated ?? "【Error】translation failed please try again later";
  } catch (error) {
    console.log(`【Error】${error}`);
    return `【Error】${error}`;
  }    
}