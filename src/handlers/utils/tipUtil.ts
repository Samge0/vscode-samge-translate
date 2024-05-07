import * as dateUtil from './dateUtil';

// log delimiter
const TAG_LOG_DELIMITER = "==========================================================================================================\n";

// replace dots horizontal lines underscores and camel humps with spaces, because the sticky english translation engine may not be able to recognize it properly
// 替换点、横线、下划线以及驼峰命名为空格，因为粘黏的英文翻译引擎可能无法正常识别。
export function preprocessText(text: string | undefined) {
	if (!text) {
		return "";
	}
    return text.replace(/\.|-|_/g, ' ')
               .replace(/([a-z])([A-Z])/g, '$1 $2')
			   ;
}


// get configuration related prompts
export function getConfigTip(configName: string): string {
	return `【Error】please configure first：${configName}。Configure-Path：File>Preferences>Settings>Extensions>Vscode Samge Translate Configuration`;
}


// default display text after assembly translation
export function genCommonShowInfo(text: string, translatedResult: string): string {
	text = preprocessText(text);
	let result = `[${dateUtil.getCurrDateString()}]\n\n${TAG_LOG_DELIMITER}Processing-Results（${translatedResult.length}）：\n${translatedResult}\n\n${TAG_LOG_DELIMITER}Processing-Content（${text.length}）：\n${text}\n`;
	return result;
}


// default display text after assembly translation
export function genhtmlShowInfo(text: string, translatedResult: string): string {
	return `<html><body>
	<h3>[${dateUtil.getCurrDateString()}]</h3>
	<p>${TAG_LOG_DELIMITER}</p>
    <h3>Processing-Results（${translatedResult.length}）：</h3>
    <p>${translatedResult.replaceAll("\n", "<br>")}</p>
	<br>
	<p>${TAG_LOG_DELIMITER}</p>
    <h3>Processing-Content（${text.length}）：</h3>
    <p>${preprocessText(text).replaceAll("\n", "<br>")}</p>
</body></html>`;
}
