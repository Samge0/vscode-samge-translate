import axios, { AxiosRequestConfig } from "axios";
import { OpenApiResponse } from "./types";
import { packageVersion } from "./utils";

const ua = `volc-sdk-nodejs/v${packageVersion}`;

export default async function request<Result>(
  url: string,
  reqInfo: AxiosRequestConfig
): Promise<OpenApiResponse<Result>> {
  const { headers = {} } = reqInfo;
  const reqOption: AxiosRequestConfig = {
    url: url.trim(),
    timeout: 10000,
    ...reqInfo,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      "User-Agent": ua,
    },
    validateStatus: null,
  };
  const res = await axios(reqOption);
  const body = res.data;
  return body;
}
