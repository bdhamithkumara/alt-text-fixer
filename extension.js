// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const htmlparser2 = require('htmlparser2');
const vueTemplateCompiler = require('vue-template-compiler');

let diagnosticCollection;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('altTextFixer.scanFile', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        const languageId = document.languageId.toLowerCase().trim();
        console.log(`Alt Text Fixer: Document languageId (raw): "${document.languageId}"`);
        console.log(`Alt Text Fixer: Document languageId (normalized): "${languageId}"`);

        const supportedLanguages = ['html', 'javascriptreact', 'typescriptreact', 'vue', 'svelte', 'astro'];
        if (!supportedLanguages.includes(languageId)) {
            vscode.window.showWarningMessage('This command only works for HTML, JSX, TSX, Vue, Svelte, or Astro files.');
            return;
        }

        const text = document.getText();
        const diagnostics = [];
        const supportedTags = vscode.workspace.getConfiguration('altTextFixer').get('supportedTags', ['img', 'Image', 'v-img']);

        let currentLine = 0;
        let currentTag = null;
        let attributes = {};

        const parser = new parse.Parser({
            onopentag(name, attribs) {
                if (supportedTags.includes(name)) {
                    currentTag = name;
                    attributes = attribs;
                }
            },
            onclosetag() {
                if (currentTag) {
                    if (!attributes.alt) {
                        diagnostics.push({
                            message: `Missing alt attribute for ${currentTag} tag`,
                            range: new vscode.Range(currentLine, 0, currentLine, document.lineAt(currentLine).text.length),
                            severity: vscode.DiagnosticSeverity.Error,
                            source: 'Alt Text Fixer',
                            code: 'missing-alt'
                        });
                    } else if (attributes.alt.trim() === '') {
                        diagnostics.push({
                            message: `Empty alt attribute for ${currentTag} tag`,
                            range: new vscode.Range(currentLine, 0, currentLine, document.lineAt(currentLine).text.length),
                            severity: vscode.DiagnosticSeverity.Warning,
                            source: 'Alt Text Fixer',
                            code: 'empty-alt'
                        });
                    } else if (attributes.alt.match(/(\.png|\.jpg|\.jpeg|\.gif|\.svg|image)$/i)) {
                        diagnostics.push({
                            message: `Poor alt text: "${attributes.alt}" may not describe the image's purpose (avoid filenames or "image")`,
                            range: new vscode.Range(currentLine, 0, currentLine, document.lineAt(currentLine).text.length),
                            severity: vscode.DiagnosticSeverity.Warning,
                            source: 'Alt Text Fixer',
                            code: 'poor-alt'
                        });
                    }
                    currentTag = null;
                    attributes = {};
                }
            },
            ontext(text) {
                currentLine += text.split('\n').length - 1;
            }
        });
        parser.write(text);
        parser.end();

        const diagnosticCollection = vscode.languages.createDiagnosticCollection('altTextFixer');
        diagnosticCollection.set(document.uri, diagnostics);
        console.log(`Alt Text Fixer: Found ${diagnostics.length} issues in ${document.fileName}`);
        console.log(`Alt Text Fixer: Set ${diagnostics.length} diagnostics for ${document.fileName}`);
    });

    context.subscriptions.push(disposable);

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(
        ['html', 'javascriptreact', 'typescriptreact', 'vue', 'svelte', 'astro'],
        {
            provideCodeActions(document, range, context) {
                const diagnostics = context.diagnostics.filter(d => d.source === 'Alt Text Fixer');
                if (!diagnostics.some(d => d.range.contains(range))) {
                    return [];
                }

                const actions = [];
                const line = document.lineAt(range.start.line);
                const lineText = line.text.trim();
                const tagMatch = lineText.match(/<(\w+)/);
                const tagName = tagMatch ? tagMatch[1] : 'img';
                const useJSXSyntax = ['javascriptreact', 'typescriptreact'].includes(document.languageId.toLowerCase().trim());
                const isTranslationSupported = ['vue', 'svelte', 'astro'].includes(document.languageId.toLowerCase().trim());

                if (diagnostics.some(d => d.code === 'missing-alt' || d.code === 'empty-alt' || d.code === 'poor-alt')) {
                    actions.push({
                        title: `Add descriptive alt text`,
                        command: 'altTextFixer.applyCustomFix',
                        arguments: [document, range, tagName, useJSXSyntax]
                    });
                    if (isTranslationSupported) {
                        actions.push({
                            title: `Add translation placeholder`,
                            command: 'altTextFixer.applyFix',
                            arguments: [document, range, `{{ t('image.alt') }}`, tagName, useJSXSyntax]
                        });
                    }
                }

                return actions;
            }
        },
        {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        }
    ));

    context.subscriptions.push(vscode.commands.registerCommand('altTextFixer.applyFix', async (document, range, altText, tagName, useJSXSyntax) => {
        const edit = new vscode.WorkspaceEdit();
        const line = document.lineAt(range.start.line);
        const lineText = line.text;
        const newText = replaceAltAttribute(lineText, tagName, altText, useJSXSyntax);
        edit.replace(document.uri, line.range, newText);
        await vscode.workspace.applyEdit(edit);

        const diagnosticCollection = vscode.languages.createDiagnosticCollection('altTextFixer');
        const diagnostics = diagnosticCollection.get(document.uri).filter(d => !d.range.isEqual(line.range));
        diagnosticCollection.set(document.uri, diagnostics);
        console.log(`Alt Text Fixer: Updated ${diagnostics.length} diagnostics for ${document.fileName}`);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('altTextFixer.applyCustomFix', async (document, range, tagName, useJSXSyntax) => {
        const altText = await vscode.window.showInputBox({
            prompt: 'Enter descriptive alt text (e.g., "Company logo" or "Chart showing sales data")',
            placeHolder: 'Describe the image’s purpose or content'
        });
        if (altText) {
            const edit = new vscode.WorkspaceEdit();
            const line = document.lineAt(range.start.line);
            const lineText = line.text;
            const newText = replaceAltAttribute(lineText, tagName, altText, useJSXSyntax);
            edit.replace(document.uri, line.range, newText);
            await vscode.workspace.applyEdit(edit);

            const diagnosticCollection = vscode.languages.createDiagnosticCollection('altTextFixer');
            const diagnostics = diagnosticCollection.get(document.uri).filter(d => !d.range.isEqual(line.range));
            diagnosticCollection.set(document.uri, diagnostics);
            console.log(`Alt Text Fixer: Updated ${diagnostics.length} diagnostics for ${document.fileName}`);
        }
    }));
}

function replaceAltAttribute(lineText, tagName, altText, useJSXSyntax) {
    let match = lineText.match(new RegExp(`<${tagName}\\s+([^>]*?)(/?)>`, 'i'));
    if (!match) return lineText;
    let attributes = match[1];
    let attrArray = attributes.split(/\s+/).filter(attr => !attr.toLowerCase().startsWith('alt='));
    let newAttributes = attrArray.join(' ').trim();
    let newText = `<${tagName} ${newAttributes} alt="${altText}"${useJSXSyntax ? ' /' : ''}>`;
    console.log(`Alt Text Fixer: Cleaned text after removing alt: <${tagName} ${newAttributes}${useJSXSyntax ? ' /' : ''}>`);
    console.log(`Alt Text Fixer: Replacing line ${lineText} -> ${newText}`);
    return newText.replace(/\s+/g, ' ').trim();
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};