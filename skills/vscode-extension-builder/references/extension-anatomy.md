# Extension Anatomy

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [package.json Manifest](#packagejson-manifest)
3. [Runtime Targeting](#runtime-targeting)
4. [Workspace Trust and Proposed APIs](#workspace-trust-and-proposed-apis)
5. [Entry Point and Lifecycle](#entry-point-and-lifecycle)
6. [Extension Context](#extension-context)
7. [Disposables](#disposables)

---

## Directory Structure

A typical modern VS Code extension project:

```text
my-extension/
├── .vscode/
│   ├── launch.json           # Debug configuration
│   └── tasks.json            # Build/test tasks
├── src/
│   ├── extension.ts          # Node/desktop entry implementation
│   ├── web/                  # Browser-only code path (optional)
│   └── test/                 # Test files
├── media/                    # Webview assets (optional)
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
├── esbuild.js                # Bundler config (or webpack.config.js)
├── .vscode-test.js           # Test CLI config (optional)
├── telemetry.json            # Telemetry event catalog (optional)
├── CHANGELOG.md
├── README.md
└── LICENSE
```

Not every extension needs every file:

- Themes, snippets, and grammar-only extensions may not need `src/extension.ts`
- Browser-capable extensions often add a separate bundled `browser` entry
- Webviews need `media/` or another asset directory

## package.json Manifest

`package.json` is the extension manifest. The most important fields are:

```json
{
  "name": "my-extension",
  "displayName": "My Extension",
  "description": "What it does",
  "version": "0.0.1",
  "publisher": "your-publisher-id",
  "engines": {
    "vscode": "^1.90.0"
  },
  "main": "./dist/extension.js",
  "browser": "./dist/web/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "myext.doSomething",
        "title": "Do Something",
        "category": "My Extension"
      }
    ]
  },
  "extensionKind": ["workspace"],
  "capabilities": {
    "untrustedWorkspaces": {
      "supported": "limited",
      "description": "%capabilities.untrustedWorkspaces.description%"
    }
  }
}
```

Field notes:

- `name`, `version`, `publisher`, and `engines.vscode` are core Marketplace fields
- `main` is the entry point for Node.js extension hosts
- `browser` is the entry point for web extensions
- `contributes` declares commands, views, settings, menus, languages, and more
- `activationEvents` is optional and is often implied by contributed features
- `extensionKind` hints whether the extension should prefer the `ui` host, the `workspace` host, or both
- `capabilities.untrustedWorkspaces` declares how the extension behaves in Restricted Mode

No-code extensions:

- Themes, snippets, icon themes, and some grammar-only extensions may omit `main`
- If there is no executable entry point, Workspace Trust often does not require any special handling

### Contributes Section

Common contribution points:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "myext.doSomething",
        "title": "Do Something",
        "category": "My Extension",
        "icon": "$(play)"
      }
    ],
    "keybindings": [
      {
        "command": "myext.doSomething",
        "key": "ctrl+shift+d",
        "mac": "cmd+shift+d",
        "when": "editorTextFocus"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "myext.doSomething",
          "when": "editorHasSelection",
          "group": "myext"
        }
      ]
    },
    "configuration": {
      "title": "My Extension",
      "properties": {
        "myext.enableFeature": {
          "type": "boolean",
          "default": true,
          "description": "Enable the feature"
        }
      }
    },
    "views": {
      "explorer": [
        {
          "id": "myTreeView",
          "name": "My Tree View"
        }
      ]
    }
  }
}
```

### When Clause Contexts

Common `when` clause expressions:

- `editorTextFocus`
- `editorHasSelection`
- `editorLangId == typescript`
- `resourceExtname == .json`
- `view == myTreeView`
- `isWorkspaceTrusted`
- `config.myext.enableFeature`

## Runtime Targeting

VS Code can run extensions in multiple hosts:

- **Local extension host**: Node.js runtime on the same machine as the UI
- **Web extension host**: Browser/WebWorker runtime
- **Remote extension host**: Node.js runtime in a container, SSH host, WSL instance, or Codespace

### Choose the right manifest fields

- Use `main` when the extension needs a Node.js runtime
- Use `browser` when the extension must run in the web extension host
- Use both `main` and `browser` for hybrid extensions
- Use `extensionKind` when runtime location matters

Common `extensionKind` patterns:

```json
{
  "extensionKind": ["workspace"]
}
```

Use for most extensions that read workspace files, invoke tools, or need to run where the code lives.

```json
{
  "extensionKind": ["ui", "workspace"]
}
```

Use when the extension prefers the UI side but can also run in the workspace host.

Notes:

- Browser-only extensions should provide a `browser` entry and avoid Node-only modules
- Web-only extensions often do not need to set `extensionKind`
- If you claim browser support, prefer `vscode.workspace.fs`, `ExtensionContext.storageUri`, and `ExtensionContext.globalStorageUri` instead of assuming local disk access

## Workspace Trust and Proposed APIs

If the extension can execute workspace code, run tools, or trust repository files, declare Workspace Trust behavior explicitly:

```json
{
  "capabilities": {
    "untrustedWorkspaces": {
      "supported": "limited",
      "description": "%capabilities.untrustedWorkspaces.description%",
      "restrictedConfigurations": ["myext.toolPath"]
    }
  }
}
```

Supported values:

- `true`: Fully supported in Restricted Mode
- `false`: Disabled until the workspace is trusted
- `"limited"`: Some features work, but trust-sensitive features stay disabled

Runtime gating pattern:

```typescript
if (!vscode.workspace.isTrusted) {
  vscode.window.showInformationMessage('Trusted features are disabled in Restricted Mode.');
}

context.subscriptions.push(
  vscode.workspace.onDidGrantWorkspaceTrust(() => {
    setupTrustedFeatures(context);
  })
);
```

For proposed APIs:

- `enabledApiProposals` is for local Insiders development only
- Do not depend on proposed APIs in published stable extensions

## Entry Point and Lifecycle

### activate()

`activate()` runs when VS Code loads the extension in the selected host. Keep it light:

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand('myext.hello', async () => {
    const { runHello } = await import('./hello');
    await runHello();
  });

  context.subscriptions.push(command);
}
```

Guidelines:

- Register commands, providers, and listeners quickly
- Defer heavy imports until the feature is used
- Avoid scanning the workspace or starting background work unless the feature needs it

### deactivate()

Use `deactivate()` only for cleanup not covered by disposables:

```typescript
export function deactivate() {
  // Clean up unmanaged resources here.
}
```

## Extension Context

`vscode.ExtensionContext` provides storage, secrets, URIs, and lifecycle hooks:

```typescript
export function activate(context: vscode.ExtensionContext) {
  context.globalState.get('key');
  context.globalState.update('key', 'value');
  context.globalState.setKeysForSync(['dismissedWelcome']);

  context.workspaceState.get('workspaceKey');
  context.workspaceState.update('workspaceKey', 1);

  context.secrets.get('api-token');
  context.secrets.store('api-token', 'token');

  context.extensionUri;
  context.globalStorageUri;
  context.storageUri;
  context.logUri;
  context.extensionMode;

  context.subscriptions.push(disposable);
}
```

Use these instead of hand-rolled paths:

- `globalState` for cross-workspace key/value state
- `workspaceState` for workspace-scoped state
- `setKeysForSync` for user state that should roam across machines
- `secrets` for credentials or tokens
- `globalStorageUri`, `storageUri`, and `logUri` for file-backed data that must work across local, remote, and web contexts

## Disposables

Most VS Code registrations return a `Disposable`. Push all of them to `context.subscriptions`:

```typescript
const command = vscode.commands.registerCommand('myext.run', handler);
const listener = vscode.workspace.onDidChangeConfiguration(() => {
  // Reconfigure here.
});
const watcher = vscode.workspace.createFileSystemWatcher('**/*.json');

context.subscriptions.push(command, listener, watcher);
```

Dispose manually only when a resource has a narrower lifecycle than the whole extension.
