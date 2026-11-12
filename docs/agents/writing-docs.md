# Writing docs

Conventions for prose written into this repository: `docs/**`, `.scratch/**`, `README.md`, `CLAUDE.md`.

## Do not assume a deployment platform

Food Diary ships as a Docker image and runs in **any container-friendly environment** — `docker compose` on a VPS, a PaaS, a managed container service, a self-hosted platform. The repository owner's choice of host is one option among those and must not leak into the documentation as a requirement.

Describe **what the app requires of its environment**, never what one environment happens to provide.

Do not name, or reason from the behaviour of:

- the hosting platform or PaaS
- the reverse proxy or ingress in front of it
- the managed database vendor
- the platform's UI, its environment-variable editor, or its defaults

A sentence of the form "the platform sets X" is a property of one person's deployment, not of this app.

Names that **may** appear, because the repository contains them or hard-depends on them: Docker, `docker compose`, PostgreSQL, EF Core, Google OAuth, GitHub Actions, Docker Hub, Caddy (bundled in `deploy/compose.yml`).

A single sentence of **non-exhaustive examples** of platforms the image runs on ("e.g. Dokploy, Coolify, Render or Heroku") is allowed, so a reader recognises their own platform. The guidance around it must still hold on any platform — no steps, settings, or behaviour specific to one of them.

```markdown
<!-- BAD - a claim about one deployment, written as a property of the app -->
Deriving it from `Request.Host` is unsafe as deployed: Acme Cloud sets
`ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`, which enables `XForwardedProto`
but not `XForwardedHost`, so `Request.Host` still comes from the raw header.

<!-- GOOD - the requirement the app places on any environment -->
`Request.Host` is client-controlled behind any reverse proxy that does not
validate it, which is the default. The app therefore cannot derive its own
identity from the request, on any host.
```

### Exception: records of what happened

Documents that record a decision already made name what was actually chosen. Anonymising history makes it false. This covers `CHANGELOG.md`, superseded specs, the Context section of an ADR, and research documents citing evidence from a specific deployment.

The rule governs documents that describe how the app works or should be built. It does not govern documents that describe what someone did.

## Specs and tickets

Specs (`.scratch/<feature-slug>/spec.md`) and their tickets are read by agents and contributors who have this repository and nothing else.

- **Self-contained.** Cite repo files and public URLs only. When the owner's personal notes (e.g. an Obsidian vault) hold something the spec needs, copy it into the spec.
- **Frontend architecture.** A spec that changes the frontend has a table of the FSD layers, slices and segments it adds, changes or moves code into, naming every new slice and every new piece of Redux state.
- **Stable story numbers.** Tickets cite user stories by number, so a story keeps its number for good. To drop one, strike it through in place and say why, e.g. `24. ~~As the owner, I want …~~ Dropped: <reason>`.
- **Rebuilt flows.** A spec that rebuilds an existing flow lists that flow's user-visible behaviours, each marked kept or dropped.
- **Throwaway artifacts.** A spec that cites a prototype branch, a spike commit, or anything else deleted after implementation gets a closing ticket: replace those citations with a description of the design as built, then delete the artifact.
