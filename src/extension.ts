// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as translateHepler from './handlers/translateHepler';
import * as decoration from './handlers/decoration';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// read properties
	translateHepler.updateConfig(context);


	if (!translateHepler.enableThis) {
		console.log("enableThis=false，do not initialize");
		return;
	}


	// monitoring configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('samge.translate')) {
			console.log("configuration changes update");
            translateHepler.updateConfig(context, event);
        }
    }));


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension `vscode-samge-translate` is now active!');

	
	// key monitoring for converting english to chinese
	let disposable_en2zh = vscode.commands.registerCommand('samge.translate.en2zh', () => {
		translateHepler.handleEn2zh(false);
    });

	
	// key monitoring for converting english to chinese with replace
	let disposable_en2zhReplace = vscode.commands.registerCommand('samge.translate.en2zhReplace', () => {
		translateHepler.handleEn2zh(true);
    });


	// key monitoring for converting chinese to english
	let disposable_zh2en = vscode.commands.registerCommand('samge.translate.zh2en', () => {
		translateHepler.handleZh2en(false);
    });


	// key monitoring for converting chinese to english with replace
	let disposable_zh2enReplace = vscode.commands.registerCommand('samge.translate.zh2enReplace', () => {
		translateHepler.handleZh2en(true);
    });


	// key monitoring for chinese variable name conversion
	let disposable_zh2var = vscode.commands.registerCommand('samge.translate.zh2var', () => {
		translateHepler.handleZh2var();
    });


	// text editor focus change listening used to automatically remove the translation result text displayed on the right side
	let disposable_onDidChangeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection(event => {
		decoration.clearDecoration(event.textEditor);
	});


	// listening for events where a text editor loses focus including switching from one editor to another or when the editor loses focus such as when the user clicks on other non editing areas of vs code
	let disposable_onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(newEditor => {
        translateHepler.handleOnDidChangeActiveTextEditor(newEditor);
    });


	// register hover provider
	let disposable_hoverProvider = vscode.languages.registerHoverProvider({ scheme: 'file', language: '*' }, {
		async provideHover(document, position, token) {
			return translateHepler.handleHover(document, position, token);
		}
	});
	

	// register shortcut command listening events
    context.subscriptions.push(
		disposable_en2zh, 
		disposable_en2zhReplace, 
		disposable_zh2en, 
		disposable_zh2enReplace, 
		disposable_zh2var,
		disposable_onDidChangeTextEditorSelection,
		disposable_onDidChangeActiveTextEditor,
		disposable_hoverProvider,
	);

}


// This method is called when your extension is deactivated
export function deactivate() {}
