# Common VS Code APIs

## Table of Contents

1. [Window API](#window-api)
2. [Editor & Document](#editor--document)
3. [Workspace API](#workspace-api)
4. [Language Features](#language-features)
5. [Webview API](#webview-api)
6. [Tree View API](#tree-view-api)
7. [Output & Diagnostics](#output--diagnostics)

---

## Window API

### Show Messages

```typescript
// Information, warning, error
vscode.window.showInformationMessage('Info');
vscode.window.showWarningMessage('Warning');
vscode.window.showErrorMessage('Error');

// With action buttons
const choice = await vscode.window.showInformationMessage(
  'Save changes?',
  'Yes', 'No', 'Cancel'
);
if (choice === 'Yes') { /* ... */ }
```

### Input & Selection

```typescript
// Text input
const value = await vscode.window.showInputBox({
  prompt: 'Enter a name',
  placeHolder: 'e.g., my-component',
  value: 'default',
  validateInput: (text) => {
    return text.length === 0 ? 'Name cannot be empty' : null;
  }
});

// Quick pick (single selection)
const item = await vscode.window.showQuickPick(
  ['Option A', 'Option B', 'Option C'],
  { placeHolder: 'Choose an option' }
);

// Quick pick (multi-selection)
const items = await vscode.window.showQuickPick(
  ['A', 'B', 'C'],
  { canPickMany: true, placeHolder: 'Select items' }
);

// Quick pick with detail
const richItems = await vscode.window.showQuickPick([
  { label: 'TypeScript', description: '.ts', detail: 'Typed JavaScript' },
  { label: 'JavaScript', description: '.js', detail: 'Dynamic scripting' }
]);

// File/folder picker
const uri = await vscode.window.showOpenDialog({
  canSelectFiles: true,
  canSelectFolders: false,
  canSelectMany: false,
  filters: { 'JSON': ['json'], 'All': ['*'] }
});
```

### Progress

```typescript
await vscode.window.withProgress({
  location: vscode.ProgressLocation.Notification,
  title: 'Processing...',
  cancellable: true
}, async (progress, token) => {
  token.onCancellationRequested(() => {
    console.log('User cancelled');
  });

  progress.report({ increment: 0, message: 'Starting...' });
  await doWork();
  progress.report({ increment: 50, message: 'Halfway...' });
  await doMoreWork();
  progress.report({ increment: 100, message: 'Done!' });
});
```

### Status Bar

```typescript
const item = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left,  // or Right
  100  // priority (higher = further left)
);
item.text = '$(sync~spin) Building...';  // Codicon icons with $(name)
item.tooltip = 'Click to cancel';
item.command = 'myext.cancelBuild';
item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
item.show();
```

## Editor & Document

### Active Editor

```typescript
const editor = vscode.window.activeTextEditor;
if (!editor) return;

const document = editor.document;
const selection = editor.selection;
const text = document.getText(selection);  // Selected text
const allText = document.getText();         // Full document
const lineText = document.lineAt(0).text;   // Line text
const fileName = document.fileName;
const languageId = document.languageId;
const uri = document.uri;
```

### Edit Operations

```typescript
// Replace selection
await editor.edit(editBuilder => {
  editBuilder.replace(editor.selection, 'new text');
});

// Insert at position
await editor.edit(editBuilder => {
  editBuilder.insert(new vscode.Position(0, 0), 'inserted text\n');
});

// Delete range
await editor.edit(editBuilder => {
  const range = new vscode.Range(
    new vscode.Position(0, 0),
    new vscode.Position(0, 10)
  );
  editBuilder.delete(range);
});

// Multiple edits at once
await editor.edit(editBuilder => {
  editBuilder.replace(range1, 'text1');
  editBuilder.replace(range2, 'text2');
});
```

### Decorations

```typescript
const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'rgba(255, 0, 0, 0.3)',
  border: '1px solid red',
  after: {
    contentText: ' ← issue here',
    color: 'red'
  }
});

const decorations: vscode.DecorationOptions[] = [
  {
    range: new vscode.Range(0, 0, 0, 10),
    hoverMessage: 'This has an issue'
  }
];

editor.setDecorations(decorationType, decorations);
```

### Events

```typescript
// Active editor changed
vscode.window.onDidChangeActiveTextEditor(editor => { ... });

// Document text changed
vscode.workspace.onDidChangeTextDocument(event => {
  const { document, contentChanges } = event;
});

// Document saved
vscode.workspace.onDidSaveTextDocument(document => { ... });

// Document opened/closed
vscode.workspace.onDidOpenTextDocument(document => { ... });
vscode.workspace.onDidCloseTextDocument(document => { ... });
```

## Workspace API

### Configuration

```typescript
// Read settings
const config = vscode.workspace.getConfiguration('myext');
const value = config.get<boolean>('enableFeature', true);

// Update settings
await config.update('enableFeature', false, vscode.ConfigurationTarget.Global);
await config.update('enableFeature', false, vscode.ConfigurationTarget.Workspace);

// Listen for changes
vscode.workspace.onDidChangeConfiguration(e => {
  if (e.affectsConfiguration('myext.enableFeature')) {
    // Reconfigure
  }
});
```

### File System

```typescript
// Read file
const uri = vscode.Uri.file('/path/to/file');
const content = await vscode.workspace.fs.readFile(uri);
const text = Buffer.from(content).toString('utf8');

// Write file
const data = Buffer.from('content', 'utf8');
await vscode.workspace.fs.writeFile(uri, data);

// Check if file exists
try {
  await vscode.workspace.fs.stat(uri);
  // File exists
} catch {
  // File does not exist
}

// List directory
const entries = await vscode.workspace.fs.readDirectory(uri);
// entries: [name, FileType][]

// Delete
await vscode.workspace.fs.delete(uri, { recursive: true });
```

Use `vscode.workspace.fs` for code paths that must work in browser, remote, or virtual workspaces.
Avoid assuming resources are always on the local disk.

### File Watchers

```typescript
const watcher = vscode.workspace.createFileSystemWatcher(
  '**/*.json',     // glob pattern
  false,           // ignoreCreateEvents
  false,           // ignoreChangeEvents
  false            // ignoreDeleteEvents
);

watcher.onDidCreate(uri => console.log('Created:', uri.fsPath));
watcher.onDidChange(uri => console.log('Changed:', uri.fsPath));
watcher.onDidDelete(uri => console.log('Deleted:', uri.fsPath));
```

### Workspace Folders

```typescript
const folders = vscode.workspace.workspaceFolders;
if (folders) {
  const rootPath = folders[0].uri.fsPath;
}

// Find files
const files = await vscode.workspace.findFiles(
  '**/*.ts',           // include
  '**/node_modules/**' // exclude
);
```

### Workspace Trust

```typescript
if (!vscode.workspace.isTrusted) {
  vscode.window.showInformationMessage(
    'Trusted features are disabled in Restricted Mode.'
  );
}

const trustListener = vscode.workspace.onDidGrantWorkspaceTrust(() => {
  // Register or enable trust-sensitive features here.
});

context.subscriptions.push(trustListener);
```

For menus and views, use the `isWorkspaceTrusted` context key in `when` clauses.

## Language Features

### Completion Provider

```typescript
vscode.languages.registerCompletionItemProvider('typescript', {
  provideCompletionItems(document, position, token, context) {
    const item = new vscode.CompletionItem('mySnippet');
    item.insertText = new vscode.SnippetString('console.log($1);');
    item.documentation = 'Insert a console.log statement';
    item.kind = vscode.CompletionItemKind.Snippet;
    return [item];
  }
}, '.');  // Trigger character
```

### Hover Provider

```typescript
vscode.languages.registerHoverProvider('typescript', {
  provideHover(document, position, token) {
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range);
    return new vscode.Hover(`**${word}**: some documentation`);
  }
});
```

### Definition Provider

```typescript
vscode.languages.registerDefinitionProvider('typescript', {
  provideDefinition(document, position, token) {
    return new vscode.Location(
      vscode.Uri.file('/path/to/definition'),
      new vscode.Position(10, 0)
    );
  }
});
```

### Code Action Provider

```typescript
vscode.languages.registerCodeActionsProvider('typescript', {
  provideCodeActions(document, range, context, token) {
    const action = new vscode.CodeAction(
      'Extract to function',
      vscode.CodeActionKind.RefactorExtract
    );
    action.edit = new vscode.WorkspaceEdit();
    action.edit.replace(document.uri, range, 'extractedFunction()');
    return [action];
  }
});
```

### Diagnostics

```typescript
const diagnosticCollection = vscode.languages.createDiagnosticCollection('myext');

const diagnostic = new vscode.Diagnostic(
  new vscode.Range(0, 0, 0, 10),
  'This is a warning',
  vscode.DiagnosticSeverity.Warning
);
diagnostic.code = 'myext-001';
diagnostic.source = 'My Extension';

diagnosticCollection.set(document.uri, [diagnostic]);
```

### Document Formatting

```typescript
vscode.languages.registerDocumentFormattingEditProvider('mylang', {
  provideDocumentFormattingEdits(document, options, token) {
    const edits: vscode.TextEdit[] = [];
    // Generate formatting edits
    return edits;
  }
});
```

## Webview API

### Create Webview Panel

```typescript
const panel = vscode.window.createWebviewPanel(
  'myWebview',           // viewType
  'My Webview',          // title
  vscode.ViewColumn.One, // column
  {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: [
      vscode.Uri.joinPath(context.extensionUri, 'media')
    ]
  }
);

// Set HTML content
panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
```

### Webview HTML

```typescript
function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'main.js')
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'style.css')
  );
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <link href="${styleUri}" rel="stylesheet">
  <title>My Webview</title>
</head>
<body>
  <h1>Hello Webview</h1>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
```

### Webview Messaging

```typescript
// Extension → Webview
panel.webview.postMessage({ type: 'update', data: payload });

// Webview → Extension
panel.webview.onDidReceiveMessage(message => {
  switch (message.type) {
    case 'save':
      handleSave(message.data);
      break;
    case 'error':
      vscode.window.showErrorMessage(message.text);
      break;
  }
});
```

In the webview JavaScript:

```javascript
const vscode = acquireVsCodeApi();

// Send to extension
vscode.postMessage({ type: 'save', data: { ... } });

// Receive from extension
window.addEventListener('message', event => {
  const message = event.data;
  switch (message.type) {
    case 'update':
      updateUI(message.data);
      break;
  }
});

// Persist state across visibility changes
vscode.setState({ count: 5 });
const state = vscode.getState();  // { count: 5 }
```

## Tree View API

### TreeDataProvider

```typescript
class MyTreeDataProvider implements vscode.TreeDataProvider<MyItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<MyItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: MyItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: MyItem): Thenable<MyItem[]> {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    }
    return Promise.resolve(element.children);
  }

  private getRootItems(): MyItem[] {
    return [
      new MyItem('Item 1', vscode.TreeItemCollapsibleState.Collapsed),
      new MyItem('Item 2', vscode.TreeItemCollapsibleState.None),
    ];
  }
}

class MyItem extends vscode.TreeItem {
  children: MyItem[] = [];

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
    this.tooltip = `Tooltip for ${this.label}`;
    this.description = 'description';
    this.iconPath = new vscode.ThemeIcon('file');
    this.command = {
      command: 'myext.openItem',
      title: 'Open Item',
      arguments: [this]
    };
  }
}
```

### Register Tree View

```typescript
const provider = new MyTreeDataProvider();
const treeView = vscode.window.createTreeView('myTreeView', {
  treeDataProvider: provider,
  showCollapseAll: true
});
context.subscriptions.push(treeView);

// Refresh
vscode.commands.registerCommand('myext.refreshTree', () => provider.refresh());
```

## Output & Diagnostics

### Output Channel

```typescript
const outputChannel = vscode.window.createOutputChannel('My Extension');
outputChannel.appendLine('Starting process...');
outputChannel.show();  // Show the output panel

// Log channel (with timestamps and log levels)
const logChannel = vscode.window.createOutputChannel('My Extension', { log: true });
logChannel.info('Info message');
logChannel.warn('Warning message');
logChannel.error('Error message');
```

Prefer a log channel over `console.log` for logs that users may need to inspect when reporting issues.

### Terminal

```typescript
const terminal = vscode.window.createTerminal({
  name: 'My Task',
  cwd: '/path/to/dir',
  env: { NODE_ENV: 'development' }
});
terminal.sendText('npm run build');
terminal.show();
```
