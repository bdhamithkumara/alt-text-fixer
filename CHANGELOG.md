# Changelog

All notable changes to the **Alt Text Fixer** extension will be documented in this file.  
Check [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) for recommendations on how to structure this file.

---

## [Unreleased]

- None

---


## [0.0.4] - 2025-05-13

### Added

 - New quick fix: Add descriptive alt text with a guided prompt to encourage WCAG-compliant alt text (e.g., "Company logo").
 - Quick fix: Add translation placeholder for Vue, Svelte, and Astro files (e.g., {{ t('image.alt') }}) to support multilingual projects.
 - Diagnostic warning for poor alt text (e.g., filenames or "image") to promote accessibility best practices.
 - SEO keywords in package.json to improve discoverability.

 ### Changed

- Removed non-compliant quick fixes (Add alt="filename.png", Add alt="filename", Add alt="filename image") based on community feedback.
- Updated README.md to include accessibility guidelines and clarify complementary use with linters like ESLint.
- Revised extension description and command title to emphasize WCAG compliance.

### Fixed

- Ensured compatibility with existing fixes for Astro and Svelte language ID recognition and duplicate alt attribute prevention.

---

## [0.0.3] - 2025-05-13

### Changed

- Updated `README.md` to include a **"How It Works"** section with instructional GIFs showing:
  - How to run the extension.
  - How to choose quick fix options.
- Added a **Support & Contributions** section encouraging users to star the repo and contribute.
- Clarified features and usage instructions for better onboarding experience.

---

## [0.0.2] - 2025-05-13

### Added

- Extension icon (`media/icon.png`) for display in the VS Code Marketplace and Extensions view.

### Changed

- Simplified quick fix labels by removing descriptive text "(filename with extension)", "(filename without extension)", and "(filename + image)" from options like `Add alt="filename.png"`, `Add alt="filename"`, and `Add alt="filename image"`.
- Removed non-functional comments in `extension.js` to clean up the codebase.

---

## [0.0.1] - 2025-05-13

### Added

- Initial release of the **Alt Text Fixer** extension.
- Support for detecting missing or empty `alt` attributes in `<img>`, `<Image>`, and `<v-img>` tags across **HTML**, **JSX**, **TSX**, **Vue**, **Svelte**, and **Astro** files.
- Quick fixes for adding alt attributes:
  - `Add alt="filename.png"` (filename with extension)
  - `Add alt="filename"` (filename without extension)
  - `Add alt="filename image"` (filename + "image")
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
