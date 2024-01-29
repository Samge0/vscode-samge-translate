export const packageName = "volcengine/openapi";
export const packageVersion = "1.16.0";

export function getDefaultOption(accessKeyId: string = "", secretKey: string = "") {
  const defaultOptions = {
    host: "open.volcengineapi.com",
    region: "cn-north-1",
    protocol: "https:",
    accessKeyId: accessKeyId,
    secretKey: secretKey,
  };
  return defaultOptions;
}
