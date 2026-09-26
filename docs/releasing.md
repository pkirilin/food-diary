# Releasing

Releases are published to [Docker Hub](https://hub.docker.com/r/pkirilin/food-diary) and as GitHub releases via the [Release workflow](../.github/workflows/release.yml).

To cut a new release:

1. Update `CHANGELOG.md`. Either:
   - **(a) Manually:** rename the `[Unreleased]` section to
     `[X.Y.Z] - <short descriptive title>`
     (e.g. `[0.5.0] - Node.js 24 & minor packages bump`), and add a fresh empty
     `[Unreleased]` section above it.
   - **(b) With Claude Code:** run the `draft-release-changelog` skill, which
     drafts the entry from commits since the latest tag, auto-determines the
     version bump, and commits the change for you.
2. Commit, push, and merge to `main`.
3. Go to **Actions → Release → Run workflow**.
4. Enter the version (e.g. `0.4.0`, no `v` prefix) and run.

The workflow validates inputs, builds the image, pushes `pkirilin/food-diary:X.Y.Z` and `pkirilin/food-diary:latest` to Docker Hub, creates the `vX.Y.Z` git tag, and publishes the GitHub release with notes extracted from the matching `CHANGELOG.md` section.

If a release fails partway through (e.g. the image is pushed but the git tag step fails), clean up manually: a re-run of the same version is blocked by the Docker Hub tag-existence check. Either delete the published Docker Hub tag (Docker Hub UI → Tags → Delete), or push the git tag and create the release with `gh` from your machine:

```shell
gh workflow run release.yml --ref main -f version=x.y.z
```
