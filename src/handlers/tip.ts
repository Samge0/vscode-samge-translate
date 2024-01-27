import * as dateUtil from './dateUtil';


// replace dots horizontal lines underscores and camel humps with spaces some translations do not support line breaks and need to handle line breaks
// 替换点、横线、下划线以及驼峰命名为空格，有的翻译不支持传换行文本，需要处理换行
export function preprocessText(text: string | undefined) {
	if (!text) {
		return "";
	}
    return text.replace(/\.|-|_/g, ' ')
               .replace(/([a-z])([A-Z])/g, '$1 $2')
               .replace(/\r\n|\r|\n/g, '. ');
			   ;
}


// get configuration related prompts
export function getConfigTip(configName: string): string {
	return `【Error】please configure first：${configName}。Configure-Path：File>Preferences>Settings>Extensions>Vscode Samge Translate Configuration`;
}


// default display text after assembly translation
export function genCommonShowInfo(text: string, translatedResult: string): string {
	text = preprocessText(text);
	let result = `[${dateUtil.getCurrDateString()}]\n\nProcessing-Results（${translatedResult.length}）：\n${translatedResult}\n\nProcessing-Content（${text.length}）：\n${text}\n`;
	return result;
}


// default display text after assembly translation
export function genhtmlShowInfo(text: string, translatedResult: string): string {
	return `<html><body>
    <h3>[${dateUtil.getCurrDateString()}]</h3>
    <h3>Processing-Results（${translatedResult.length}）：</h3>
    <p>${translatedResult}</p>
	<br>
    <h3>Processing-Content（${text.length}）：</h3>
    <p>${preprocessText(text)}</p>
</body></html>`;
}
