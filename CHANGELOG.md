# Changelog

All notable changes to Food Diary are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - AI recognition improvements and release automation

### Added

- Release automation via GitHub Actions: automated tagging, Docker Hub publishing, and GitHub release creation
- Configurable OpenAI model via `Integrations:OpenAI:Model` setting (defaults to `gpt-5.4-mini`)

### Changed

- Calories now use `decimal` precision to preserve product-label accuracy
- Image content-type validation is now case-insensitive per RFC 2045 (accepts `image/JPEG`, `IMAGE/PNG`, etc.)
- Improved food recognition prompts with explicit per-rule guidelines for handling labels, product photos, and multiple images

### Fixed

- Note recognition no longer crashes when OpenAI returns fractional calorie values
- Note recognition no longer crashes when OpenAI returns string values in numeric fields
- Images with no recognizable food product now return HTTP 400 (user error) instead of HTTP 500 (server error), with a clear validation message
- AI recognition is now ~4x faster
