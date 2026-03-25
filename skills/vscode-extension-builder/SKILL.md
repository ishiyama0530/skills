---
name: vscode-extension-builder
description: Build, modernize, and publish Visual Studio Code extensions for desktop, remote, and web environments. Use when Codex needs to create or update a VS Code extension, add commands, views, webviews, language features, or configuration, choose `package.json` contributions, configure `activationEvents`, `browser`, or `extensionKind`, support Workspace Trust or telemetry, run extension tests, or package and publish with `@vscode/vsce`.
---

# VS Code Extension Builder

Build modern VS Code extensions that behave well across desktop, remote, and web hosts.

## Quick Start

1. Clarify the runtime target before scaffolding: desktop/workspace, UI, web, or hybrid.
2. Scaffold with `npx --package yo --package generator-code -- yo code`.
3. Choose `New Extension (TypeScript)` for Node-based extensions or `New Web Extension` when the extension must run in the browser.
4. Prefer native contribution points and VS Code UX patterns before reaching for a webview.
5. Package with local devDependencies: `npm install --save-dev @vscode/vsce` and `npx @vscode/vsce package`.
6. Test the actual hosts you claim to support: desktop with `@vscode/test-electron`, web with `@vscode/test-web`, remote with a Dev Container, Codespace, SSH, or WSL window.

## Core Workflow

### 1. Gather Requirements

Ask about:

- Purpose and primary user workflow
- Extension type: command, tree view, webview, language feature, theme, snippet, debugger, notebook, AI/chat, and so on
- Runtime target: desktop only, remote workspace, browser/web, or hybrid
- Workspace access: whether the extension reads workspace files, executes tools, or requires trust
- UI surface: command palette, menus, status bar, views, walkthroughs, or notifications
- Distribution target: private VSIX, Marketplace, pre-release, or internal only
- Telemetry and online services: whether the extension sends usage data or makes network calls

### 2. Choose the Smallest Viable Architecture

Prefer the lightest pattern that solves the problem:

- **No-code contribution extension**: Use for themes, snippets, simple grammars, or static contributions. These often need no `main` entry point and usually do not need Workspace Trust.
- **Command/workspace extension**: Use for file operations, diagnostics, formatters, or integrations that need Node.js or workspace access. Usually use `main` and often prefer `extensionKind: ["workspace"]`.
- **UI extension**: Use for status bar, walkthrough, or editor-adjacent features that should stay close to the UI. Consider `extensionKind: ["ui", "workspace"]` only if the code can run in either place.
- **Web extension**: Use when the extension must run in `vscode.dev` or the browser-based Codespaces editor. Provide a `browser` entry and avoid Node-only APIs or modules.
- **Webview extension**: Use only when native contribution points cannot provide the required UX.

See `references/extension-anatomy.md` for manifest structure and lifecycle details.
See `references/activation-events.md` for lazy activation patterns.
See `references/best-practices.md` for UX, trust, telemetry, testing, and publishing guidance.

### 3. Scaffold the Project

Use the Yeoman generator:

```bash
npx --package yo --package generator-code -- yo code
```

Choose the scaffold that matches the runtime target:

- `New Extension (TypeScript)` for Node-based desktop or workspace extensions
- `New Web Extension` for browser-compatible extensions
- A specialized template only when the feature genuinely needs it

Prefer:

- TypeScript
- Strict compiler settings
- `esbuild` for most Node-based extensions
- The generator's web template or build setup when targeting a browser runtime

### 4. Implement Core Functionality

Apply these defaults:

- Define commands in `contributes.commands` with a clear `category`
- Register commands, providers, and listeners inside `activate()`
- Push all disposables to `context.subscriptions`
- Use `OutputChannel` or log channels for extension logs; reserve `console` for local debugging
- Use `withProgress`, status bar items, or output channels for long-running work
- Use `QuickPick` and `InputBox` for lightweight flows
- Use webviews sparingly and lock them down with CSP and `localResourceRoots`

Command pattern:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "myext.runTask",
        "title": "Run Task",
        "category": "My Extension"
      }
    ]
  }
}
```

```typescript
export function activate(context: vscode.ExtensionContext) {
  const log = vscode.window.createOutputChannel('My Extension', { log: true });

  const runTask = vscode.commands.registerCommand('myext.runTask', async () => {
    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Running task...' },
      async () => {
        log.info('Task started');
        // Do work here.
      }
    );
  });

  context.subscriptions.push(log, runTask);
}
```

### 5. Configure the Manifest for the Real Runtime

Treat `package.json` as the product contract.

Add or review:

- `main` for Node.js extension hosts
- `browser` for web extensions
- `extensionKind` when local UI vs workspace location matters
- `capabilities.untrustedWorkspaces` when Workspace Trust affects behavior
- `contributes.*` with `when` clauses and categories that match VS Code UX conventions
- `activationEvents` only when they are not implied by contributions
- `enabledApiProposals` only for local Insiders development; never depend on proposed APIs for published stable extensions

Activation guidance:

- Rely on implicit activation for contributed `commands`, `views`, `languages`, `customEditors`, `notebooks`, and authentication providers when possible
- Add explicit activation events for cases such as `workspaceContains`, `onUri`, `onFileSystem`, `onStartupFinished`, or niche APIs that are not implied
- Prefer the narrowest activation event that matches the feature
- Avoid `*` unless the extension truly must load at startup

### 6. Make the Extension Safe in Restricted and Remote Contexts

Before shipping, decide whether the extension works in:

- Untrusted workspaces
- Remote workspaces, Codespaces, SSH, or WSL
- Browser-based VS Code

If the extension reads workspace files, executes tools, shells out, or trusts repository content, declare `capabilities.untrustedWorkspaces` explicitly and gate trust-sensitive features.
If the extension can run in the browser, provide a `browser` entry and remove Node-only dependencies from that path.
If the extension runs remotely, test that shelling out, file access, and paths behave correctly on the workspace machine rather than assuming a local host.

### 7. Test the Supported Hosts

Use layered testing:

- Unit tests for pure logic
- Integration tests with `@vscode/test-cli` and `@vscode/test-electron`
- Browser tests with `@vscode/test-web` when a `browser` entry or web support exists
- Manual debug runs with F5 in the Extension Development Host
- Remote verification in a Dev Container, Codespace, SSH, or WSL session when runtime location matters

Use the same environments in tests that the manifest claims to support.

### 8. Package and Publish

Prefer local tools and reproducible CI:

```bash
npm install --save-dev @vscode/vsce
npx @vscode/vsce package
npx @vscode/vsce publish
```

Before publishing, confirm:

- `README.md`, `CHANGELOG.md`, `LICENSE`, and icon are present
- `publisher`, `repository`, `categories`, and `keywords` are set
- The bundle and tests pass in CI
- `VSCE_PAT` is used as a secret in CI rather than hardcoding credentials
- `telemetry.json` exists if the extension emits telemetry

## Modern Defaults

### Runtime First

Choose the runtime before choosing libraries.
Desktop-only Node modules, shell commands, and native binaries usually exclude browser support.

### Trust Aware

Declare `capabilities.untrustedWorkspaces` intentionally.
Disable trust-sensitive features until the workspace is trusted.

### UX Native by Default

Prefer command palette commands, views, settings, status bar items, code actions, and quick picks before inventing custom UI.
Use webviews only when native contributions cannot support the experience.

### Lazy and Disposable

Keep `activate()` light.
Lazy-load heavy dependencies and dispose every command, watcher, provider, and event subscription.

### Transparent Telemetry

Collect as little telemetry as possible.
Respect `isTelemetryEnabled` and `onDidChangeTelemetryEnabled`.
Avoid PII and document what is collected.

## Troubleshooting

### Command Not Appearing

- Check `contributes.commands`
- Check the command `category` and `title`
- Avoid redundant explicit `onCommand` activation when contribution-based implicit activation is enough
- Reload the window and inspect running extensions

### Works Locally but Fails Remotely

- Check `extensionKind`
- Check whether shell commands or absolute paths assume a local machine
- Test in a Dev Container, Codespace, SSH, or WSL window

### Works on Desktop but Not in the Browser

- Check whether the extension has a `browser` entry
- Remove Node-only modules and APIs from the web path
- Run browser tests with `@vscode/test-web`

### Disabled in Restricted Mode

- Check `capabilities.untrustedWorkspaces`
- Gate workspace-reading, task-running, or shell-executing features until trust is granted

## Reference Navigation

Load these references as needed:

- **references/extension-anatomy.md**: Use for extension structure, `package.json` fields, runtime targeting (`main`, `browser`, `extensionKind`), Workspace Trust declarations, lifecycle, storage, and disposables.
- **references/activation-events.md**: Use for activation strategy, implicit activation, and newer activation events for AI, terminal, search, and walkthrough features.
- **references/common-apis.md**: Use for window, editor, workspace, trust, webview, tree view, output channel, and diagnostics APIs.
- **references/best-practices.md**: Use for UX guidance, performance, security, Workspace Trust, telemetry, testing, remote/web compatibility, and publishing.
