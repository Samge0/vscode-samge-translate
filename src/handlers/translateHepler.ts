import * as vscode from 'vscode';
import * as decoration from './decoration';
import * as tipUtil from './utils/tipUtil';
import * as cryptoUtil from './utils/cryptoUtil';
import * as camelCaseUtil from './utils/camelCaseUtil';
import * as translateBaidu from './translationEngines/translateBaidu';
import * as translateAlibaba from './translationEngines/translateAlibaba';
import * as translateTencent from './translationEngines/translateTencent';
import * as translateVolcano from './translationEngines/translateVolcano';
import * as translateYoudao from './translationEngines/translateYoudao';
import * as translateDeepL from './translationEngines/translateDeepL';


// translation engine type
export enum ProviderNameEnum {
    Baidu = "baidu",
    Tencent = "tencent",
    Alibaba = "alibaba",
    Volcano = "volcano",
    Youdao = "youdao",
    DeepL = "deepl",
}


// translation engine invocation strategy
const translationStrategies = {
    [ProviderNameEnum.Baidu.toLowerCase()]: translateBaidu.translateText,
    [ProviderNameEnum.Tencent.toLowerCase()]: translateTencent.translateText,
    [ProviderNameEnum.Alibaba.toLowerCase()]: translateAlibaba.translateText,
    [ProviderNameEnum.Volcano.toLowerCase()]: translateVolcano.translateText,
    [ProviderNameEnum.Youdao.toLowerCase()]: translateYoudao.translateText,
    [ProviderNameEnum.DeepL.toLowerCase()]: translateDeepL.translateText,
};


// if it is a single key，providerAppId and providerAppSecret can only have one value that is not empty
function isSingleKey(providerName: string): boolean {
	return ProviderNameEnum.DeepL.toLowerCase() === providerName;
}


// a model for storing translation engines app id and app secret
interface ProviderData {
    providerAppId: string;
    providerAppSecret: string;
}


// the last editor for the operation
let lastEditor: vscode.TextEditor | undefined = undefined;


export let enableThis: boolean = true; // 是否启用插件，Default：true
let enableHover: boolean = false; // 是否在鼠标悬浮时自动翻译，Default：false
let enableOutput: boolean = true; // 是否在OUTPUT窗口展示，Default：true
let enableRightDisplay: boolean = true; // 是否在选中文本右侧展示处理结果，Default：true
let languageFrom: string = "en"; // 翻译源语言，Default：en
let languageTo: string = "zh"; // 翻译目标语言，Default：zh
let providerName: string = "baidu"; // 翻译引擎提供者，Default：baidu
let providerAppId: string = ""; // 翻译引擎的appId
let providerAppSecret: string = ""; // 翻译引擎的appSecret
let limitSingleMaximum: number = 1000; // 单次翻译最大字符限制，超过自动截断，Default：1000

let shortZh2varEnable: boolean = false; // 是否开启：短词快捷翻译 - 若开启此选项，可按快捷键将光标左侧连续中文词组转为指定格式的英文，Default：false
let shortZh2varEnableLettersAndNumbers: boolean = true; // 短词快捷翻译 - 光标左侧词组提取是否允许字母跟数字，Default：true | true=`中文+字母+数字`连续词组 false=仅`中文`连续词组
let shortZh2varLimitSingleMaximum: number = 20; // 短词快捷翻译 - 单次翻译最大字符限制，超过则提示错误信息，Default：20（这里的字母跟数字不参与字符个数计算）


// update configuration
export function updateConfig(
	context: vscode.ExtensionContext,
	event: vscode.ConfigurationChangeEvent | undefined = undefined,
) {
	const properties = vscode.workspace.getConfiguration();
	enableThis = properties.get<boolean>('samge.translate.enable', true); // 是否启用插件，Default：true
	enableHover = properties.get<boolean>('samge.translate.enableHover', false); // 是否在鼠标悬浮时自动翻译，Default：false
	enableOutput = properties.get<boolean>('samge.translate.enableOutput', true); // 是否在OUTPUT窗口展示，Default：true
	enableRightDisplay = properties.get<boolean>('samge.translate.enableRightDisplay', true); // 是否在选中文本右侧展示处理结果，Default：true
	languageFrom = properties.get<string>('samge.translate.translateFrom', 'en'); // 翻译源语言，Default：en
	languageTo = properties.get<string>('samge.translate.translateTo', 'zh'); // 翻译目标语言，Default：zh
	providerName = properties.get<string>('samge.translate.providerName', 'baidu'); // 翻译引擎提供者，Default：baidu
	providerAppId = properties.get<string>('samge.translate.providerAppId', ''); // 翻译引擎的appId
	providerAppSecret = properties.get<string>('samge.translate.providerAppSecret', ''); // 翻译引擎的appSecret
	limitSingleMaximum = properties.get<number>('samge.translate.limitSingleMaximum', 1000); // 单次翻译最大字符限制，超过自动截断
	shortZh2varEnable = properties.get<boolean>('samge.translate.shortZh2var.enable', false); // 是否开启：短词快捷翻译 - 若开启此选项，可按快捷键将光标左侧连续中文词组转为指定格式的英文，Default：false
	shortZh2varEnableLettersAndNumbers = properties.get<boolean>('samge.translate.shortZh2var.enableLettersAndNumbers', true); // 短词快捷翻译 - 光标左侧词组提取是否允许字母跟数字，Default：true | true=`中文+字母+数字`连续词组 false=仅`中文`连续词组
	shortZh2varLimitSingleMaximum = properties.get<number>('samge.translate.shortZh2var.limitSingleMaximum', 20); // 短词快捷翻译 - 单次翻译最大字符限制，超过则提示错误信息，Default：20（这里的字母跟数字不参与字符个数计算）

	// parse ProviderData cache
	if (event) {

		// if the value of provider app id or provider app secret changes update the cache
		const isProviderValueChange = event.affectsConfiguration('samge.translate.providerAppId') || event.affectsConfiguration('samge.translate.providerAppSecret');
		if (isProviderValueChange) {
			console.log(`isProviderValueChange：${providerAppId} ${providerAppSecret}`);
			setProviderDataCache(context, providerName, providerAppId, providerAppSecret);
		}

		// if the translation engine is switched read cache
		const isProviderNameChange = event.affectsConfiguration('samge.translate.providerName');
		if (isProviderNameChange) {
			const ProviderDataCache = getProviderDataCache(context, providerName);
			if (ProviderDataCache) {
				console.log(`isProviderNameChange：${providerName} ${ProviderDataCache?.providerAppId}  ${ProviderDataCache?.providerAppSecret}`);
				providerAppId = ProviderDataCache?.providerAppId ?? "";
				providerAppSecret = ProviderDataCache?.providerAppSecret ?? "";
	
				// update cache values to vscode configuration
				updateConfigurations(properties, providerAppId, providerAppSecret);
			} else {
				updateConfigurations(properties, "", "");
			}
		}
	}
}


// update configuration
function updateConfigurations(
	properties: vscode.WorkspaceConfiguration,
	providerAppId: string,
	providerAppSecret: string,
) {
    try {
		properties.update('samge.translate.providerAppId', providerAppId, vscode.ConfigurationTarget.Global);
		console.log(`【providerAppId】 Configuration updated successfully => ${providerAppId}`);

		properties.update('samge.translate.providerAppSecret', providerAppSecret, vscode.ConfigurationTarget.Global);
		console.log(`【providerAppSecret】 Configuration updated successfully => ${providerAppSecret}`);
    } catch (error) {
        console.error('Error updating configuration:', error);
    }
}


// read cached data from translation engine providers
export function setProviderDataCache(
	context: vscode.ExtensionContext,
	cacheKey: string,
	providerAppId: string,
	providerAppSecret: string,
) {
	if (!cacheKey) {
		return;
	}
	const providerData: ProviderData = {
		providerAppId: cryptoUtil.encryptData(providerAppId),
		providerAppSecret: cryptoUtil.encryptData(providerAppSecret)
	};
	console.log(`setProviderDataCache ${cacheKey} ${providerAppId} ${providerAppSecret}`);
	context.globalState.update(cacheKey.toLowerCase(), providerData);
}


// read cached data from translation engine providers
export function getProviderDataCache(
	context: vscode.ExtensionContext, 
	cacheKey: string
): ProviderData | undefined {
	if (!cacheKey) {
		return undefined;
	}
	console.log(`getProviderDataCache ${cacheKey}`);
	const cacheValue = context.globalState.get(cacheKey.toLowerCase()) as ProviderData;
	if (cacheValue) {
		cacheValue.providerAppId = cryptoUtil.decryptData(cacheValue.providerAppId),
		cacheValue.providerAppSecret = cryptoUtil.decryptData(cacheValue.providerAppSecret);
	}
	return cacheValue;
}


// perform translation operations
export async function translateText(
	text: string | undefined, 
	providerName: string | undefined, 
	providerAppId: string | undefined, 
	providerAppSecret: string | undefined, 
	languageFrom: string | undefined, 
	languageTo: string | undefined,
	limitSingleMaximum: number | undefined
): Promise<string> {
	if (!text) {
		return "";
	}
	if (!providerName) {
		return tipUtil.getConfigTip("providerName");
	}

	if (isSingleKey(providerName)) {
		if (!providerAppId && !providerAppSecret) {
			return tipUtil.getConfigTip("providerAppId or providerAppSecret");
		}
		providerAppId = providerAppId ?? "";
		providerAppSecret = providerAppSecret ?? "";
	} else {
		if (!providerAppId) {
			return tipUtil.getConfigTip("providerAppId");
		}
		if (!providerAppSecret) {
			return tipUtil.getConfigTip("providerAppSecret");
		}
	}
	
	if (!languageFrom) {
		languageFrom = "en";
	}
	if (!languageTo) {
		languageTo = "zh";
	}
	if (!limitSingleMaximum) {
		limitSingleMaximum = 1000;
	}

	// preprocessing text
	text = tipUtil.preprocessText(text);
	if (text.length > limitSingleMaximum) {
		// truncate text to ensure its length does not exceed limitSingleMaximum
		text = text.substring(0, limitSingleMaximum);
		// prompt when exceeding the length
		const message = `The text length exceeds the limit of ${limitSingleMaximum}, the text has been truncated, if you need to translate long text please modify the configuration yourself.\n（文本长度超过${limitSingleMaximum}的配置限制，文本已被截断。如果需要翻译长文本，请自行修改配置）`;
		vscode.window.showInformationMessage(message, "More").then(selection => {
			if (selection === "More") {
				const panel = vscode.window.createWebviewPanel(
					'message', 
					'Warning Tip',
					vscode.ViewColumn.One,
					{}
				);
				panel.webview.html = message;
			}
		});
	}
	console.log(`preprocessed text to be translated：${text}`);

	const translate = translationStrategies[providerName.toLowerCase()];
	if (translate) {
		return translate(text, providerAppId, providerAppSecret, languageFrom, languageTo);
	} else {
		return `【Error】the translation engine is currently not supported：[${providerName}]，the currently supported translation engines include：${Object.keys(translationStrategies).join(', ')}`;
	}
    
}


// display of processing results
export function handlerResultDisplay(
	editor: vscode.TextEditor | undefined, 
	text: string, 
	translatedResult: string,
	enableOutput: boolean,
	enableRightDisplay: boolean,
	enableReplace: boolean
) {
	// process translated text here
	console.log(`handlerResultDisplay：${text} => ${translatedResult}`);

	if (!text && !translatedResult) {
		console.log("【Warn】the content is empty and will not be translated");
		return;
	}

	// default pop up prompt in the bottom right corner only displaying text no click event
	// vscode.window.showInformationMessage(translatedResult);
	
	// default pop up prompt in the bottom right corner click event for viewing messages
	vscode.window.showInformationMessage(translatedResult, "More").then(selection => {
		if (selection === "More") {
			// display in webview mode
			const panel = vscode.window.createWebviewPanel(
				'translationResult', // identifier
				'Processing-Results', // panel title
				vscode.ViewColumn.One, // display in which part of the editor
				{}
			);
			panel.webview.html = tipUtil.genhtmlShowInfo(text, translatedResult);
		}
	});

	// display processing results in the OUTPUT panel
	if (enableOutput) {
		const outputChannel = vscode.window.createOutputChannel("Processing-Results");
		outputChannel.appendLine(tipUtil.genCommonShowInfo(text, translatedResult));
		outputChannel.show(true);
	}

	// display the processing results directly to the right of the selected text
	if (enableRightDisplay && !enableReplace) {
		decoration.addDecoration(editor, translatedResult);
	}

	// optional pop up options, allow users to directly replace selected text or append translations, this feature is only valid for selected text
	if (editor && !enableReplace) {
		const hasSelection = editor.selections.some(selection => !selection.isEmpty);
		if (!hasSelection) {
			return;
		}

		// allow users to directly replace selected text or append translations
		let options = [
			`Replace | 直接替换选中文本`,
			`Append & Select | 将译文追加到选中文本末尾并选中译文`
		];
		vscode.window.showQuickPick(options).then(selection => {
			if (!selection) {
				return;
			}
			const selectionValue = selection.split(" | ")[0];
			console.log(`you have chosen: ${text} => ${selectionValue}`);
		
			if ("Replace" === selectionValue) {
				replaceEditorSelectedTextOnly(editor, translatedResult);
			} else {
				appendTranslationAndSelect(editor, text, translatedResult);
			}
			
		});
	}

}


/**
 * Function to append translated text and select it in the editor.
 *
 * @param {vscode.TextEditor | undefined} editor - The editor to work on.
 * @param {string} text - The original text.
 * @param {string} translatedResult - The translated text to append.
 */
function appendTranslationAndSelect(
	editor: vscode.TextEditor | undefined, 
	text: string, 
	translatedResult: string
) {

	// replace
	if (editor) {
        const selection = editor.selection;
        const newText = text + translatedResult;

        // use the editor's edit function to replace the selected text with the original + translation, and select the translation section
        editor.edit((editBuilder) => {
            editBuilder.replace(selection, newText);
        }).then(() => {
			const splitList = translatedResult.split('\n');
			const start = new vscode.Position(selection.end.line, selection.end.character);
			const endLine = start.line + splitList.length - 1;
			let endCharacter = start.character;

			// calculate end character position
			if (endLine > start.line) {
				// in the case of multiple lines of text
				endCharacter = translatedResult.length - translatedResult.lastIndexOf('\n', translatedResult.length - 1) - 1;
			} else {
				// only one line of text
				endCharacter = start.character + translatedResult.length;
			}

			const translatedSelection = new vscode.Selection(start.line, start.character, endLine, endCharacter);
            editor.selection = translatedSelection;
        });

	}
}


// english to chinese
export function handleEn2zh(enableReplace: boolean) {
	if (!enableThis) {
		console.log("enableThis is false，do not execute function handleEn2zh");
		return;
	}

	lastEditor = vscode.window.activeTextEditor;
	console.log(`trigger en2zh => ${lastEditor}`);
	if (lastEditor) {
		const selection = lastEditor.selection;
		const text = lastEditor.document.getText(selection);

		// calling translation functions
		translateText(text, providerName, providerAppId, providerAppSecret, languageFrom, languageTo, limitSingleMaximum).then(translatedResult => {
			handlerResultDisplay(lastEditor, text, translatedResult, enableOutput, enableRightDisplay, enableReplace);

			if (enableReplace) {
				replaceEditorSelectedTextWithDisplay(lastEditor, text, translatedResult);
			}
		});
	}
}


// chinese to english
export function handleZh2en(enableReplace: boolean) {
	if (!enableThis) {
		console.log("enableThis is false，do not execute function handleZh2en");
		return;
	}

	lastEditor = vscode.window.activeTextEditor;
	console.log(`trigger zh2en => ${lastEditor}`);
	if (lastEditor) {
		const selection = lastEditor.selection;
		const text = lastEditor.document.getText(selection);
		
		// calling translation functions
		translateText(text, providerName, providerAppId, providerAppSecret, "zh", "en", limitSingleMaximum).then(translatedResult => {
			handlerResultDisplay(lastEditor, text, translatedResult, enableOutput, enableRightDisplay, enableReplace);

			if (enableReplace) {
				replaceEditorSelectedTextWithDisplay(lastEditor, text, translatedResult);
			}
		});
	}
}


// continuous chinese characters in front of the cursor
function getContinuousChineseLeftOfCursor(editor: vscode.TextEditor | undefined): string {
	if (!editor) {
		return "";
	}

	const position = editor.selection.active;
    const lineText = editor.document.lineAt(position.line).text;
    const textBeforeCursor = lineText.substring(0, position.character);

    const match = shortZh2varEnableLettersAndNumbers ? textBeforeCursor.match(/[\u4e00-\u9fa5a-zA-Z0-9]+$/) : textBeforeCursor.match(/[\u4e00-\u9fa5]+$/);
	if (!match || match[0].length <= 0) {
		vscode.window.showErrorMessage(`No valid Chinese text found to the left of the cursor`);
		return "";
	}
	
	const matchText = match[0];

	// Short Phrase Quick Translate => ignoring the length of letters and numbers
	const nonChineseCharacters = matchText.match(/[a-zA-Z0-9]/g) || [];
	const nonChineseLength = nonChineseCharacters.length;

	const chineseLength = matchText.length - nonChineseLength;
	if (chineseLength > shortZh2varLimitSingleMaximum) {
		vscode.window.showErrorMessage(`text length exceeds limit：chineseLength(${chineseLength}) > limit(${shortZh2varLimitSingleMaximum}).`);
		return "";
	}

	return matchText;
}


// chinese transformation variable name
export function handleZh2var() {
	
	if (!enableThis) {
		console.log("enableThis is false，do not execute function handleZh2var");
		return;
	}

	lastEditor = vscode.window.activeTextEditor;
	console.log(`trigger zh2var => ${lastEditor}`);
	if (lastEditor) {
		const selection = lastEditor.selection;
		let text = lastEditor.document.getText(selection);
		let isSelectionText = true;
	
		if (!text && shortZh2varEnable) {
			isSelectionText = false;
			text = getContinuousChineseLeftOfCursor(lastEditor);
		}

		if (!text) {
			return;
		}

		// calling translation functions
		translateText(text, providerName, providerAppId, providerAppSecret, "zh", "en", limitSingleMaximum).then(translatedResult => {
			translatedResult = translatedResult.replace(".", "");
			// select conversion type
			let options = [
				`${camelCaseUtil.camelCase(translatedResult)} | 驼峰(小) camelCaseUtil`,
				`${camelCaseUtil.capitalCase(translatedResult)} | 分词(大) Capital Case`,
				`${camelCaseUtil.constantCase(translatedResult)} | 常量 CONSTANT_CASE`,
				`${camelCaseUtil.dotCase(translatedResult)} | 对象属性 dot case`,
				`${camelCaseUtil.headerCase(translatedResult)} | 中划线(大) Header-Case`,
				`${camelCaseUtil.noCase(translatedResult)} | 分词(小) no case`,
				`${camelCaseUtil.paramCase(translatedResult)} | 中划线(小) param-case`,
				`${camelCaseUtil.pascalCase(translatedResult)} | 驼峰(大) PascalCase`,
				`${camelCaseUtil.pathCase(translatedResult)} | 文件路径 path/case`,
				`${camelCaseUtil.snakeCase(translatedResult)} | 下划线 snake_case`
			];
			vscode.window.showQuickPick(options).then(selection => {
				if (!selection) {
					return;
				}
				const selectionValue = selection.split(" | ")[0];
				console.log(`you have chosen: ${text} => ${selectionValue}`);
				if (isSelectionText) {
					replaceEditorSelectedTextWithDisplay(lastEditor, text, selectionValue);
				} else {
					replaceTextLeftOfCursor(lastEditor, text, selectionValue);
				}
			});
		});
	}
}


// chinese transformation variable name - by camelCaseType
export const handleZh2varCamelCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.CamelCase);
export const handleZh2varCapitalCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.CapitalCase);
export const handleZh2varConstantCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.ConstantCase);
export const handleZh2varDotCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.DotCase);
export const handleZh2varHeaderCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.HeaderCase);
export const handleZh2varNoCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.NoCase);
export const handleZh2varParamCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.ParamCase);
export const handleZh2varPascalCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.PascalCase);
export const handleZh2varPathCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.PathCase);
export const handleZh2varSnakeCase = () => handleZh2varWithCamelCaseType(camelCaseUtil.CamelCaseEnum.SnakeCase);


// chinese transformation variable name - by camelCaseType
export function handleZh2varWithCamelCaseType(camelCaseType: string) {
	
	if (!enableThis) {
		console.log(`enableThis is false，do not execute function handleZh2varWithCamelCaseType - ${camelCaseType}`);
		return;
	}

	lastEditor = vscode.window.activeTextEditor;
	console.log(`trigger handleZh2varWithCamelCaseType ${camelCaseType} => ${lastEditor}`);
	if (!lastEditor) {
		return;
	}

	// dealing with manually selected text
	const selection = lastEditor.selection;
	let text = lastEditor.document.getText(selection);
	let isSelectionText = true;

	if (!text && shortZh2varEnable) {
		isSelectionText = false;
		text = getContinuousChineseLeftOfCursor(lastEditor);
	}
	
	if (!text) {
		return;
	}

	// calling translation functions
	translateText(text, providerName, providerAppId, providerAppSecret, "zh", "en", limitSingleMaximum).then(translatedResult => {
		translatedResult = translatedResult.replace(".", "");
		const camelCaseResult = camelCaseUtil.getResultWithType(camelCaseType, translatedResult);
		if (isSelectionText) {
			replaceEditorSelectedTextWithDisplay(lastEditor, text, camelCaseResult);
		} else {
			replaceTextLeftOfCursor(lastEditor, text, camelCaseResult);
		}
	});
}


// replace the chinese text to the left of the cursor
function replaceTextLeftOfCursor(
	editor: vscode.TextEditor | undefined, 
	oldText: string, 
	replaceText: string
) {
    if (!editor) {
       return;
    }
	
	const position = editor.selection.active;
	const start = new vscode.Position(position.line, position.character - oldText.length);
	const end = position;
	const range = new vscode.Range(start, end);
	editor.edit(editBuilder => {
		editBuilder.replace(range, replaceText);
	});
}


// replace editor selected text, and display
function replaceEditorSelectedTextWithDisplay(
	editor: vscode.TextEditor | undefined, 
	oldText: string, 
	replaceText: string
) {
	if (editor) {
		editor.edit(editBuilder => {
			const selectionRange = editor.selection;
			editBuilder.replace(selectionRange, replaceText);
		}).then(success => {
			const resultMsg = success ? `successfully replaced text: ${oldText} => ${replaceText}` : "replacing text failed";
			const enableRightDisplay = false, enableReplace = true;
			handlerResultDisplay(lastEditor, oldText, resultMsg, enableOutput, enableRightDisplay, enableReplace);
		});
	}
}


// replace editor selected text only
function replaceEditorSelectedTextOnly(
	editor: vscode.TextEditor | undefined, 
	replaceText: string
) {
	if (editor) {
		editor.edit((editBuilder) => {
			editBuilder.replace(editor.selection, replaceText);
		});
	}
}


// handling when the mouse hovers over text
export async function handleHover(
	document: vscode.TextDocument, 
	position: vscode.Position, 
	token: vscode.CancellationToken
) {
	
	if (!enableThis) {
		console.log("enableThis is false，do not execute function handleHover");
		return;
	}
	if (!enableThis || !enableHover) {
		return;
	}

	// // translate only the currently floating word
	// const word = document.getText(document.getWordRangeAtPosition(position));
	// console.log(`text to be translated：${word} ${position} ${token}`);
	// const translatedResult = await translateText(providerName, word, providerAppId, providerAppSecret, languageFrom, languageTo, limitSingleMaximum);
	// return new vscode.Hover(`${word} => ${translatedResult}`);

	lastEditor = vscode.window.activeTextEditor;
	if (!lastEditor) {
		return;
	}

	// get the currently selected text
	const selection = lastEditor.selection;
	let text = '';

	if (!selection.isEmpty) {
		// the user selected a segment of text
		text = document.getText(selection);
	} else {
		// the user did not select the text and only hovered over one word
		text = document.getText(document.getWordRangeAtPosition(position));
	}

	const translatedResult = await translateText(text, providerName, providerAppId, providerAppSecret, languageFrom, languageTo, limitSingleMaximum);

	// display hover results
	return new vscode.Hover(translatedResult);
}


// handling the loss of focus in edit boxes
export function handleOnDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined) {
	if (editor !== lastEditor) {
		decoration.clearDecoration(lastEditor);
		lastEditor = editor;
	}
}