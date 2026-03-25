# Activation Events

## Table of Contents

1. [Overview](#overview)
2. [Implicit Activation](#implicit-activation)
3. [Explicit Activation Events](#explicit-activation-events)
4. [Newer and Specialized Events](#newer-and-specialized-events)
5. [Performance Strategies](#performance-strategies)

---

## Overview

Activation events control **when** VS Code loads your extension. The best default is to activate only when the user needs the feature.

```json
{
  "activationEvents": ["workspaceContains:**/package.json"]
}
```

Since VS Code 1.74+, many activation events are inferred automatically from contributions. Do not add explicit activation events when the contribution already implies one.

## Implicit Activation

Common contributions that imply activation:

| Contribution | Implied Activation |
|---|---|
| `contributes.commands` | `onCommand:<commandId>` |
| `contributes.views` | `onView:<viewId>` |
| `contributes.customEditors` | `onCustomEditor:<viewType>` |
| `contributes.notebooks` | `onNotebook:<notebookType>` |
| `contributes.authentication` | `onAuthenticationRequest:<providerId>` |
| `contributes.languages` | `onLanguage:<languageId>` when grammar or configuration is contributed |

Implication for authoring:

- Do not add explicit `onCommand` for a command that is already in `contributes.commands`
- Do not add explicit `onView` when the view is already contributed
- Do not add explicit `onLanguage:<id>` just because you contribute the language

## Explicit Activation Events

Use explicit events when the feature is not covered by contributions.

### workspaceContains

Activate only when a workspace contains a marker file:

```json
{
  "activationEvents": ["workspaceContains:**/package.json"]
}
```

Use for project-type-specific features.

### onUri

Activate when the extension's custom URI scheme is opened:

```json
{
  "activationEvents": ["onUri"]
}
```

### onFileSystem

Activate when a specific file-system scheme is used:

```json
{
  "activationEvents": ["onFileSystem:sftp"]
}
```

### onStartupFinished

Activate after VS Code startup completes:

```json
{
  "activationEvents": ["onStartupFinished"]
}
```

Use when background setup must happen eventually, but should not block startup.

### onWebviewPanel

Activate when VS Code restores a serialized webview panel:

```json
{
  "activationEvents": ["onWebviewPanel:myWebviewType"]
}
```

## Newer and Specialized Events

The official activation event list continues to grow. Common specialized events to remember:

- `onChatParticipant`: AI/chat participant extensions
- `onLanguageModelTool`: language model tool contributions
- `onTerminal`, `onTerminalProfile`, `onTerminalShellIntegration`: terminal-specific features
- `onSearch`: custom search providers
- `onTaskType`: custom task providers
- `onWalkthrough`: walkthrough content
- `onOpenExternalUri`: external URI handling
- `onIssueReporterOpened`: issue reporter integrations
- `onRenderer`: notebook or editor renderers
- `onEditSession`: edit session support

When working on newer VS Code capabilities, always verify whether the contribution point already implies activation before adding an explicit event.

## Performance Strategies

### Prefer implied activation

```json
{
  "contributes": {
    "commands": [
      {
        "command": "myext.analyze",
        "title": "Analyze",
        "category": "My Extension"
      }
    ]
  }
}
```

This command contribution already implies activation. Adding `onCommand:myext.analyze` is usually redundant.

### Use the narrowest explicit event

```json
// Broad
"activationEvents": ["onLanguage"]

// Narrower
"activationEvents": ["workspaceContains:**/myext.config.json"]
```

Choose the event that most closely matches the real trigger.

### Avoid `*`

```json
{
  "activationEvents": ["*"]
}
```

Avoid startup activation unless the extension truly must load immediately.

### Defer heavy work after activation

```typescript
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('myext.analyze', async () => {
      const analyzer = await import('./analyzer');
      await analyzer.run();
    })
  );
}
```

Register lightweight entry points first, then import heavy modules on demand.

### Measure impact

Use **Developer: Show Running Extensions** to inspect activation time and keep `activate()` as small as possible.
