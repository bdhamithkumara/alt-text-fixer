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
function activate(ctx) {
    console.log('Alt Text Fixer: Extension activated');

    // Create a diagnostic collection
    diagnosticCollection = vscode.languages.createDiagnosticCollection('altTextFixer');
    ctx.subscriptions.push(diagnosticCollection);

    // Register the scan command
    const scanCommand = vscode.commands.registerCommand('altTextFixer.scanFile', async () => {
        console.log('Alt Text Fixer: Scan File command executed');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        const supportedLanguages = ['html', 'javascript', 'javascriptreact', 'typescriptreact', 'vue', 'svelte', 'astro'];
        console.log(`Alt Text Fixer: Document languageId: ${document.languageId}`);
        if (!supportedLanguages.includes(document.languageId)) {
            vscode.window.showWarningMessage('This command only works for HTML, JSX, TSX, Vue, Svelte, or Astro files.');
            return;
        }

        // Clear previous diagnostics
        diagnosticCollection.clear();

        // Parse the content
        const text = document.getText();
        const issues = findMissingAltAttributes(text, document, document.languageId);

        // Show diagnostics and decorations
        showIssues(issues, document, editor, ctx);
    });

    ctx.subscriptions.push(scanCommand);

    // Register code actions provider
    ctx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            ['html', 'javascript', 'javascriptreact', 'typescriptreact', 'vue', 'svelte', 'astro'],
            new AltTextCodeActionProvider(),
            { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
        )
    );

    // Update diagnostics on document change
    ctx.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (vscode.window.activeTextEditor?.document === event.document) {
                updateDiagnostics(event.document, diagnosticCollection);
            }
        })
    );

    // Register command for prompting custom alt text
    ctx.subscriptions.push(
        vscode.commands.registerCommand('altTextFixer.promptForAltText', async (document, line, tagName, useJSXSyntax) => {
            console.log('Alt Text Fixer: Prompt for alt text command executed');
            const altText = await vscode.window.showInputBox({
                prompt: `Enter alt text for the ${tagName} tag`,
                placeHolder: 'e.g., Company logo'
            });

            if (altText) {
                const edit = new vscode.WorkspaceEdit();
                const lineText = document.lineAt(line).text;
                let newText = replaceAltAttribute(lineText, tagName, altText, useJSXSyntax);
                console.log(`Alt Text Fixer: Replacing line ${line}: ${lineText} -> ${newText}`);
                edit.replace(
                    document.uri,
                    new vscode.Range(line, 0, line, Number.MAX_VALUE),
                    newText
                );
                await vscode.workspace.applyEdit(edit);
                // Update diagnostics after fix
                updateDiagnostics(document, diagnosticCollection);
            }
        })
    );
}

// Helper function to replace or add alt attribute
function replaceAltAttribute(lineText, tagName, altText, useJSXSyntax) {
    // Step 1: Remove any existing alt attribute
    const altRegex = /\s+alt\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/i;
    let cleanedText = lineText.replace(altRegex, '').trim();
    console.log(`Alt Text Fixer: Cleaned text after removing alt: ${cleanedText}`);

    // Step 2: Match the tag and insert new alt attribute
    const tagRegex = new RegExp(`<${tagName}\\s+([^>]*?)(/?)>`, 'i');
    const match = cleanedText.match(tagRegex);
    let newText;
    if (match) {
        const attributes = match[1].trim();
        newText = `<${tagName} ${attributes} alt="${altText}"${useJSXSyntax ? ' /' : ''}>`;
        newText = newText.replace(/\s+/g, ' ').trim(); // Normalize spaces
    } else {
        // Fallback: Manual insertion
        newText = lineText.replace(
            new RegExp(`<${tagName}\\s*([^>]*?)(/?)>`, 'i'),
            `<${tagName} $1 alt="${altText}"${useJSXSyntax ? ' /' : ''}>`
        );
    }
    return newText;
}

// Parse Vue template from .vue file
function parseVueTemplate(text) {
    try {
        const compiled = vueTemplateCompiler.parseComponent(text);
        return compiled.template ? compiled.template.content : '';
    } catch (error) {
        console.error('Alt Text Fixer: Error parsing Vue template:', error);
        return '';
    }
}

// Find missing or empty alt attributes/props
// Find missing or empty alt attributes/props
function findMissingAltAttributes(text, document, languageId) {
    const issues = [];
    let lineNumber = 0;
    const isJSX = languageId === 'javascript' || languageId === 'javascriptreact' || languageId === 'typescriptreact';
    const isVue = languageId === 'vue';
    const isSvelte = languageId === 'svelte';
    const isAstro = languageId === 'astro';

    // Get supported tags from configuration
    const config = vscode.workspace.getConfiguration('altTextFixer');
    const supportedTags = config.get('supportedTags', ['img', 'Image', 'v-img']).map(tag => tag.toLowerCase());

    // Parse Vue template if .vue file
    const contentToParse = isVue ? parseVueTemplate(text) : text;

    const parser = new htmlparser2.Parser({
        onopentag(name, attribs) {
            const tagName = name.toLowerCase();
            // Only check for alt attributes on supported image tags
            if (supportedTags.includes(tagName)) {
                const altValue = attribs.alt;
                let src = attribs.src || attribs[':src'] || ''; // Handle Vue's :src
                if ((isJSX || isVue) && src.startsWith('{')) {
                    src = ''; // Skip dynamic src props
                }
                const fileName = src.split('/').pop()?.split('?')[0] || 'image';
                const baseName = fileName.split('.')[0]; // Filename without extension

                // Check for missing or empty alt attributes
                if (altValue === undefined) {
                    issues.push({
                        line: lineNumber,
                        message: `Missing alt ${isJSX ? 'prop' : 'attribute'} for ${tagName} tag.`,
                        severity: vscode.DiagnosticSeverity.Error,
                        src: src,
                        fileName: fileName,
                        baseName: baseName,
                        tagName: tagName,
                        isJSX: isJSX || isVue || isSvelte || isAstro
                    });
                } else if (altValue.trim() === '' || (isJSX && altValue === '{}')) {
                    issues.push({
                        line: lineNumber,
                        message: `Empty alt ${isJSX ? 'prop' : 'attribute'} for ${tagName} tag.`,
                        severity: vscode.DiagnosticSeverity.Warning,
                        src: src,
                        fileName: fileName,
                        baseName: baseName,
                        tagName: tagName,
                        isJSX: isJSX || isVue || isSvelte || isAstro
                    });
                }
            }
        },
        ontext(text) {
            lineNumber += text.split('\n').length - 1;
        }
    }, { xmlMode: isJSX || isVue || isSvelte || isAstro });

    try {
        parser.write(contentToParse);
        parser.end();
    } catch (error) {
        console.error('Alt Text Fixer: Error parsing content:', error);
    }

    console.log(`Alt Text Fixer: Found ${issues.length} issues in ${document.fileName}`);
    return issues;
}


// Show diagnostics and bulb decorations
function showIssues(issues, document, editor, ctx) {
    const diagnostics = [];
    let decorationType;
    try {
        decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: ctx.asAbsolutePath('media/bulb.svg'),
            gutterIconSize: 'contain'
        });
    } catch (error) {
        console.error('Alt Text Fixer: Error creating decoration type:', error);
        return;
    }

    const decorations = [];

    for (const issue of issues) {
        const range = new vscode.Range(issue.line, 0, issue.line, Number.MAX_VALUE);
        const diagnostic = new vscode.Diagnostic(
            range,
            issue.message,
            issue.severity
        );
        diagnostic.code = 'alt-text-fixer';
        diagnostic.source = 'Alt Text Fixer';
        diagnostics.push(diagnostic);

        decorations.push({ range });
    }

    diagnosticCollection.set(document.uri, diagnostics);
    editor.setDecorations(decorationType, decorations);
    console.log(`Alt Text Fixer: Set ${diagnostics.length} diagnostics for ${document.fileName}`);
}

// Update diagnostics on document change
function updateDiagnostics(document, diagnosticCollection) {
    const supportedLanguages = ['html', 'javascript', 'javascriptreact', 'typescriptreact', 'vue', 'svelte', 'astro'];
    if (!supportedLanguages.includes(document.languageId)) return;

    const text = document.getText();
    const issues = findMissingAltAttributes(text, document, document.languageId);
    const diagnostics = issues.map(issue => {
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(issue.line, 0, issue.line, Number.MAX_VALUE),
            issue.message,
            issue.severity
        );
        diagnostic.code = 'alt-text-fixer';
        diagnostic.source = 'Alt Text Fixer';
        return diagnostic;
    });

    diagnosticCollection.set(document.uri, diagnostics);
    console.log(`Alt Text Fixer: Updated ${diagnostics.length} diagnostics for ${document.fileName}`);
}

// Code action provider for quick fixes
class AltTextCodeActionProvider {
    provideCodeActions(document, range, context) {
        const diagnostics = context.diagnostics.filter(d => d.code === 'alt-text-fixer' && d.source === 'Alt Text Fixer');
        console.log(`Alt Text Fixer: Found ${diagnostics.length} relevant diagnostics for code actions`);
        if (diagnostics.length === 0) {
            console.log('Alt Text Fixer: No relevant diagnostics found for code actions');
            return;
        }

        const actions = [];
        const text = document.getText();
        const languageId = document.languageId;
        const issues = findMissingAltAttributes(text, document, languageId);

        for (const issue of issues) {
            if (document.lineAt(issue.line).range.intersection(range)) {
                console.log(`Alt Text Fixer: Providing code action for issue at line ${issue.line}`);
                //  for custom alt text
                const customFix = new vscode.CodeAction(
                    'Add custom alt text',
                    vscode.CodeActionKind.QuickFix
                );
                customFix.command = {
                    command: 'altTextFixer.promptForAltText',
                    title: 'Prompt for custom alt text',
                    arguments: [document, issue.line, issue.tagName, issue.isJSX]
                };
                customFix.diagnostics = [diagnostics.find(d => d.range.start.line === issue.line)];
                actions.push(customFix);
            }
        }

        console.log(`Alt Text Fixer: Returning ${actions.length} code actions`);
        return actions;
    }
}

function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.clear();
    }
}

module.exports = {
    activate,
    deactivate
};

