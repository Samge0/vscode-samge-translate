import * as vscode from 'vscode';


// generate a decorative display style
export function genDecorationTypeType(translatedResult: string | undefined) {
	// before generating a new one it is necessary to clear the old one first
	clearDecoration();
	return vscode.window.createTextEditorDecorationType({
		after: {

			// right display
			contentText: translatedResult,
			margin: '0 0 0 1em',
			color: "#222222",
            textDecoration: `;border-radius: 4px; background-color: rgba(220, 220, 220, 0.7); padding: 2px 5px;`, // border background and inner margin styles

		}
	});
}


// decoration type
var decorationType = genDecorationTypeType("");


// add decorative functions
export function addDecoration(editor: vscode.TextEditor | undefined, translatedResult: string | undefined) {
    if (editor) {
        const selection = editor.selection;
		decorationType = genDecorationTypeType(translatedResult);
        editor.setDecorations(decorationType, [{
            range: selection
        }]);
    }
}


// clear decoration function
export function clearDecoration(editor: vscode.TextEditor | undefined = undefined) {
    editor = editor ?? vscode.window.activeTextEditor;
    if (editor && decorationType) {
        editor.setDecorations(decorationType, []); // pass an empty array to clear decorations
    }
}
