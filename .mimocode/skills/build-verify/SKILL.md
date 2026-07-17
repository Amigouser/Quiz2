---
name: build-verify
description: "Verify Quiz2 project builds correctly: server syntax check, client Vite build, output validation. Run after code changes and before commit/deploy."
---

# Build & Verify — Quiz2

Quick-build verification workflow for the Quiz2 biology tutor web app. Run this after making code changes to catch errors before commit or deploy.

## Prerequisites

- Working directory: `D:\Проекты\Quiz`
- Node.js 22+ installed
- Dependencies installed in both `client/` and `server/`

## Steps

### 1. Server syntax check

```bash
node -c server/index.js
```

Also check any modified route files:

```bash
node -c server/routes/<modified_file>.js
```

If syntax errors are found, fix them before proceeding.

### 2. Client build

```bash
npx vite build 2>&1 | Select-Object -Last 8
```

Run from `client/` directory. The last 8 lines show whether the build succeeded or failed.

A successful build produces `client/dist/` with `index.html` and bundled assets.

### 3. Validate build output

```powershell
Test-Path "client/dist/index.html"
```

If this returns `False`, the build failed silently — check the full Vite output.

### 4. (Optional) Quick server smoke test

If the dev server is running on port 3001:

```powershell
try { Invoke-RestMethod -Uri http://localhost:3001/api/health } catch { "Server not running or error: $_" }
```

## What this catches

- JavaScript syntax errors in server code (prevents deploy crashes)
- React/JSX compilation errors in client code
- Missing imports or broken module resolution
- Vite build configuration issues

## Notes

- PowerShell does not support `||` — use `; if ($?) { }` or `try/catch`
- The Vite build runs from `client/` directory, not project root
- If build fails, read the full error output — Vite usually points to the exact file and line
