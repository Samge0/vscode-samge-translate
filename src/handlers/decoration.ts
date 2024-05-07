import * as vscode from 'vscode';


// generate a decorative display style
export function genDecorationTypeType(translatedResult: string | undefined, needClean: boolean = true) {
	// before generating a new one it is necessary to clear the old one first
    if (needClean) {
        clearDecoration();
    }
	return vscode.window.createTextEditorDecorationType({
		after: {

			// right display
			contentText: (translatedResult ?? "").replaceAll("\n", ""),
			margin: '0 0 0 1em',
			color: "#222222",
            textDecoration: `;border-radius: 4px; background-color: rgba(220, 220, 220, 0.7); padding: 2px 5px;`, // border background and inner margin styles

		}
	});
}

// decorative list
const decorationTypes: vscode.TextEditorDecorationType[] = [];


// add decorative functions
export function addDecoration(editor: vscode.TextEditor | undefined, translatedResult: string | undefined) {
    if (editor && translatedResult) {
        // clear the previous ones first
        clearDecoration(editor);

        const selection = editor.selection; 
        const text = editor.document.getText(selection);

        const textList = text.split(/\r?\n/);
        const translatedResultList = translatedResult.split(/\r?\n/);

        // since the selected text may contain blank lines, it is necessary to align the list.
        for (let i = 0; i < textList.length; i++) {
            if (!textList[i].trim()) {
                translatedResultList.splice(i, 0, '');
            }
        }
        
        // add decorative text after each selected line of text
        let currentLine = selection.start.line - 1;
        textList.map((lineText, index) => {
            currentLine += 1;
            
            if (!lineText) {
                return;
            }
            if (index >= translatedResultList.length) {
                return;
            }
            const translatedResultText = translatedResultList[index];
            if (!translatedResultText) {
                return;
            }
            
            // calculate the starting position of decorative text and show the decorative
            const start = new vscode.Position(currentLine, selection.start.character + lineText.length);
            const end = new vscode.Position(currentLine, lineText.length);
            const decorationRange = new vscode.Range(start, end);
            const decorationType = genDecorationTypeType(translatedResultText, false);
            editor.setDecorations(decorationType, [{range: decorationRange}]);

            // add to collection for easy cleaning in the future
            decorationTypes.push(decorationType);
        });
    }
}


// add decorative functions (add at the end of the text regardless of whether there are multiple lines of text)
export function addASingleDecoration(editor: vscode.TextEditor | undefined, translatedResult: string | undefined) {
    if (editor && translatedResult) {
        const selection = editor.selection;
		const decorationType = genDecorationTypeType(translatedResult);
        editor.setDecorations(decorationType, [{
            range: selection
        }]);
        
        // add to collection for easy cleaning in the future
        decorationTypes.push(decorationType);
    }
}


// clear decoration function
export function clearDecoration(editor: vscode.TextEditor | undefined = undefined) {
    editor = editor ?? vscode.window.activeTextEditor;
    if (editor) {
        decorationTypes.forEach(_type => _type.dispose());
        decorationTypes.length = 0;
    }
}