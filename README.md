# NamLauncher Website

Public source for the NamLauncher website at
[namlauncher.nattapat2871.me](https://namlauncher.nattapat2871.me).

## Scope

This repository contains only the public, static website and its browser-level
regression tests. It intentionally does not contain the private Admin
application, backend/API code, deployment configuration, databases, reports,
credentials, or secrets.

## Local preview

Serve the `static` directory with any local static web server, then open the
reported localhost URL. The production website uses same-origin API routes
provided by the separately maintained private platform.

## Verification

```powershell
node --test contract-tests/*.test.mjs
```

Security reports and contribution guidance are in [SECURITY.md](SECURITY.md)
and [CONTRIBUTING.md](CONTRIBUTING.md).

The website homepage and download section publish the project's
[Code signing policy](https://namlauncher.nattapat2871.me/#code-signing-policy),
including its open-source status, the pending SignPath Foundation application,
the unsigned status of the current public installer, team roles, signing scope,
and Privacy Notice link. Direct links such as
[Download](https://namlauncher.nattapat2871.me/#download) remain aligned while
asynchronous homepage content finishes loading.

Author/creator: [nattapat2871](https://nattapat2871.me)
