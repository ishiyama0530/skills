# Best Practices

## Table of Contents

1. [UX Guidelines](#ux-guidelines)
2. [Performance and Runtime Compatibility](#performance-and-runtime-compatibility)
3. [Security and Workspace Trust](#security-and-workspace-trust)
4. [Telemetry](#telemetry)
5. [Testing](#testing)
6. [Publishing](#publishing)

---

## UX Guidelines

### Commands

- Use clear command names
- Group related commands under the same `category`
- Add keyboard shortcuts only when they are genuinely helpful
- Use `when` clauses so commands only appear in relevant contexts
- Avoid emojis in command names
- Avoid overriding built-in shortcuts

Command contribution pattern:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "myext.doSomething",
        "title": "Do Something",
        "category": "My Extension"
      }
    ]
  }
}
```

### Notifications

- Respect the user's attention
- Use information, warning, and error notifications only when necessary
- Prefer progress notifications or the status bar for long-running operations
- Offer action buttons only when the user can do something meaningful
- Add a "Do not show again" option for repeatable notifications
- Show links to logs or details when background work can fail

```typescript
await vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.Notification,
    title: 'Indexing files...',
    cancellable: true
  },
  async (progress, token) => {
    progress.report({ message: 'Starting...' });
    token.onCancellationRequested(() => {
      // Handle cancellation.
    });
  }
);
```

### Webviews

- Use webviews only when the native VS Code UI cannot support the experience
- Theme every element
- Make keyboard navigation and ARIA labels work
- Keep functionality tied to the editor or workspace
- Do not use webviews for promotions, onboarding popups, or wizard-style flows unless there is no better native surface

### Inputs and Selection

- Use `QuickPick` for choosing among options
- Use `InputBox` for free-form input
- Use multi-step input only when the flow truly needs it

## Performance and Runtime Compatibility

### Startup

- Never use `*` activation unless absolutely necessary
- Keep `activate()` lightweight
- Register commands, views, and providers first; defer heavy work
- Use dynamic imports for large modules

```typescript
const command = vscode.commands.registerCommand('myext.analyze', async () => {
  const { HeavyAnalyzer } = await import('./analyzer');
  const analyzer = new HeavyAnalyzer();
  await analyzer.run();
});
```

### Runtime

- Use `CancellationToken` in providers and long-running operations
- Debounce frequent events such as typing or file changes
- Dispose watchers, listeners, and timers
- Avoid polling when events or watchers can do the job
- Limit workspace scans and pass exclusion globs to `workspace.findFiles`

### Runtime compatibility

- Choose the runtime target before choosing libraries
- If the extension has a `browser` entry, remove Node-only APIs and dependencies from the browser path
- Prefer `vscode.workspace.fs` over direct Node `fs` when supporting browser, remote, or virtual workspaces
- Test shell commands and filesystem assumptions in remote environments if `extensionKind` or runtime location matters

### Bundling

- Bundle the extension for faster startup and smaller packages
- Prefer `esbuild` for most Node-based extensions
- Use the generator's web-ready setup for browser extensions
- Exclude sources, tests, and dev-only files from the shipped VSIX

Example `.vscodeignore`:

```text
src/**
**/*.map
.vscode/**
tsconfig.json
.vscode-test.*
```

## Security and Workspace Trust

### Webview security

Always set a strict CSP and restrict local resource access:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https:;"
/>
```

- Use `localResourceRoots`
- Avoid `eval()` and dynamic script construction
- Use nonces for scripts

### Secrets

Never store secrets in settings or `globalState`. Use `SecretStorage`:

```typescript
await context.secrets.store('api-token', token);
const token = await context.secrets.get('api-token');
await context.secrets.delete('api-token');
```

### Workspace Trust

Declare trust support in `package.json` when the extension reads workspace files, launches tools, or can execute repository-controlled code:

```json
{
  "capabilities": {
    "untrustedWorkspaces": {
      "supported": "limited",
      "description": "%capabilities.untrustedWorkspaces.description%"
    }
  }
}
```

- Use `supported: true` only if the extension is safe in Restricted Mode
- Use `supported: false` when the extension must stay disabled until trust is granted
- Use `supported: "limited"` when only some features should be enabled
- Hide or disable trust-sensitive UI in Restricted Mode

### General safety

- Sanitize file paths and configuration values
- Ask for user consent before operating outside the workspace
- Request the minimum permissions and access needed
- Use `workspace.fs` and extension storage APIs instead of assuming local disk paths

## Telemetry

- Prefer `@vscode/extension-telemetry` if Application Insights works for the project
- Otherwise, still respect `isTelemetryEnabled` and `onDidChangeTelemetryEnabled`
- Treat `telemetry.telemetryLevel` as informational only; do not rely on it as the sole gate
- Tag custom telemetry settings with `telemetry` and `usesOnlineServices`
- Ship a `telemetry.json` file when the extension sends telemetry
- Collect as little data as possible
- Never collect PII

Minimal gating pattern:

```typescript
if (!vscode.env.isTelemetryEnabled) {
  return;
}

context.subscriptions.push(
  vscode.env.onDidChangeTelemetryEnabled((enabled) => {
    if (!enabled) {
      // Stop sending telemetry.
    }
  })
);
```

## Testing

### Unit tests

Keep business logic separate from VS Code APIs and test it in isolation.

### Integration tests

Use the current test CLI flow:

```bash
npm install --save-dev @vscode/test-cli @vscode/test-electron
```

```javascript
// .vscode-test.js
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  files: 'out/test/**/*.test.js'
});
```

- Use `vscode-test` through an npm script such as `"test": "vscode-test"`
- Run tests in the Extension Development Host
- Cover commands, providers, and manifest-driven behavior

### Web tests

If the extension ships a `browser` entry or claims web support:

```bash
npm install --save-dev @vscode/test-web
```

- Run browser-based tests with `@vscode/test-web`
- Verify the extension in `vscode.dev` or browser-based Codespaces when relevant

### Remote tests

If the extension supports remote workspaces:

- Test in a Dev Container, Codespace, SSH, or WSL window
- Verify shell execution, path handling, and tool discovery on the workspace machine

## Publishing

### Pre-publish checklist

1. `README.md` clearly explains features and usage
2. `CHANGELOG.md` documents releases
3. `LICENSE` exists
4. `package.json` has `publisher`, `repository`, `categories`, and `keywords`
5. The icon is present and polished
6. Tests and bundle pass in CI
7. `telemetry.json` is present when telemetry is emitted
8. The extension has been manually checked in the hosts it claims to support

### Packaging and publishing

Prefer local devDependencies and `npx`:

```bash
npm install --save-dev @vscode/vsce
npx @vscode/vsce package
npx @vscode/vsce publish
```

Additional guidance:

- Use the latest `@vscode/vsce`, especially for web extensions
- Use `npx @vscode/vsce publish --pre-release` for preview channels
- Keep `VSCE_PAT` in CI secrets, not in source control

### CI/CD

GitHub Actions pattern:

```yaml
name: Publish Extension
on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npx @vscode/vsce publish
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
```
