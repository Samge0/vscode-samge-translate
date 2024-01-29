import Service from "./translateVolcanoSdk/service";
import { OpenApiResponse } from "./translateVolcanoSdk/types";


// Volcano translate - 火山翻译


// perform translation operations
export async function translateText(
	text: string, 
	providerAppId: string, 
	providerAppSecret: string, 
	languageFrom: string, 
	languageTo: string
): Promise<string> {

  const postBody = {
    SourceLanguage: languageFrom,
    TargetLanguage: languageTo,
    TextList: [ text ],
  };

  const service = new Service({
    host: "open.volcengineapi.com",
    serviceName: "translate",
    region: "cn-north-1",
    accessKeyId: providerAppId,
    secretKey: providerAppSecret,
  });

  const fetchApi = service.createAPI("TranslateText", {
    Version: "2020-06-01",
    method: "POST",
    contentType: "json",
  });

  const response = await fetchApi(postBody) as OpenApiResponse<any>;

  const { TranslationList, ResponseMetadata } = response;

  if (TranslationList?.length > 0) {
    return TranslationList[0].Translation;
  }

  const error = ResponseMetadata?.Error;
  
  if (error) {
    return `【Error】error_code：${error.Code}，error_msg：${error.Message}`;
  }
  return `【Error】translation failed, please try again later`;

}

