# Errors

## [ERR-20260717-001] dev-server-sandbox-listen

**Logged**: 2026-07-17T17:57:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
The Codex command sandbox blocks local listening sockets, so the vinext development server must run with elevated execution permission.

### Error
```
Error: listen EPERM: operation not permitted 0.0.0.0:9229
```

### Context
- `npm run dev` failed while the Cloudflare Vite plugin checked its inspector port.
- A minimal Node `net.createServer().listen(0, "127.0.0.1")` reproduction failed with the same `EPERM`.
- A sandboxed `curl` process also could not reach the elevated local server; HTTP verification likewise needs elevated execution.
- No project source or Vite configuration change was involved.

### Suggested Fix
Run the existing `npm run dev` command outside the command sandbox; do not alter application configuration.

### Metadata
- Reproducible: yes
- Related Files: package.json, vite.config.ts

### Resolution
- **Resolved**: 2026-07-17T17:57:00+08:00
- **Notes**: Confirmed as an execution-environment restriction, restarted with permission to listen locally, and verified from the same elevated network context.

---
