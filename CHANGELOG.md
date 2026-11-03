# Changelog

All notable changes to this project are documented in this file.

Format: <a href="https://keepachangelog.com/en/1.1.0/" target="_blank" rel="noopener noreferrer">https://keepachangelog.com/en/1.1.0/</a>. Versioning: <a href="https://semver.org/spec/v2.0.0.html" target="_blank" rel="noopener noreferrer">https://semver.org/spec/v2.0.0.html</a>.

## [1.0.0] - 2026-10-26

First release.

### Added

- Single-page mobile wedding invitation with 11 sections: cover, greeting, family and contacts, date and calendar with D-day, photo gallery with lightbox, location with Kakao map and navigation links, gift accounts, RSVP, guestbook, sharing (KakaoTalk and link copy), and footer with a large-text toggle.
- All text in `config/wedding.json` and all photos in `config/images/`, validated at build time, so the invitation can be edited without touching code. Every section can be turned off from the config.
- Placeholder date mode (`datePlaceholder`) that prints "OO월 OO일" and "D-OOO" until the date is fixed.
- Ambient effects library (light leaks, curtain light, blooms, glow, petal drift, botanical dividers, washes) that pauses off-screen and stays static under `prefers-reduced-motion`.
- Google Apps Script backend for the guestbook (post, list, password delete) and RSVP, with a preview mode that works without a backend.
- Phone numbers and bank accounts injected from environment variables instead of the repository.
- GitHub Actions workflow that builds and deploys to GitHub Pages.
- Scripts to generate the Open Graph image, placeholder photos and device screenshots.

### Fixed

- Guestbook messages keep their line breaks when stored through the Apps Script backend.
- Requests that wait too long for the Apps Script lock return a JSON error instead of an HTML error page, so the page shows the real error message.
- The location section no longer leaves an empty gap under the venue name when no hall is set.

### Security

- Guestbook and RSVP text that starts with `=`, `+`, `-` or `@` is stored as plain text, so it cannot run as a spreadsheet formula.
- The deploy workflow grants Pages and OIDC write permissions only to the deploy job; the build job has read-only access.

[1.0.0]: https://github.com/Hyogeon-Lee/Mobile-Wedding-Invitation-KR/releases/tag/v1.0.0

## Unreleased

### Changed

- Gallery keeps each photo's ratio in justified rows; after the first 12 the rest scroll sideways.
- Sections alternate flat tints; the greeting and two interludes put text over full-width photos.
- Plainer copy, a red heart favicon, line-art ornaments under section titles, a faster opening.
- Walking-route map under the location links; the unused ambient-effect layer is removed.
- Studio photos at 2000 px replace the compressed copies; cover is `gallery/22.webp`.
