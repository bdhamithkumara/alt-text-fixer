# Changelog

All notable changes to the **Alt Text Fixer** extension will be documented in this file.  
Check [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) for recommendations on how to structure this file.

---

## [Unreleased]

- None

---

## [0.0.1] - 2025-05-13

### Added

- Initial release of the **Alt Text Fixer** extension.
- Support for detecting missing or empty `alt` attributes in `<img>`, `<Image>`, and `<v-img>` tags across **HTML**, **JSX**, **TSX**, **Vue**, **Svelte**, and **Astro** files.
- Quick fixes for adding alt attributes:
  - `alt="filename.png"` (filename with extension)
  - `alt="filename"` (filename without extension)
  - `alt="filename image"` (filename + "image")
  - Custom alt text with user input
- Gutter bulb icon to highlight issues with missing or empty alt attributes.
- Configuration option `altTextFixer.supportedTags` to customize tags to check.
- `author`, `repository`, `license`, and `publisher` fields in `package.json` for VS Code Marketplace compatibility.
- `LICENSE.md` with MIT License for open-source distribution.

### Fixed

- Resolved `vsce` package warnings by adding `repository` and `license` fields in `package.json` and creating `LICENSE.md`.
- Corrected publisher ID mismatch by setting `publisher: "bdhamithkumara"` in `package.json`.
- Addressed duplicate `alt` attribute issue by updating `replaceAltAttribute` to remove existing `alt` attributes before adding new ones.
- Improved language ID recognition for **Astro** and **Svelte** files by normalizing `languageId` with `toLowerCase().trim()`.

### Changed

- Added `onStartupFinished` to `activationEvents` in `package.json` to ensure extension activation in the Development Host.
- Enhanced logging in `extension.js` to debug language ID issues for **Astro** and **Svelte** files.
