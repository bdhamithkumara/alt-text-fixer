# Alt Text Fixer
Detects missing or empty alt attributes in image tags across HTML, React, Next.js, Vue, Angular, Svelte, and Astro.

## Features
- Scans `<img>`, `<Image>`, and `<v-img>` tags.
- Highlights issues with a bulb icon.
- Quick fixes:
  - Add alt with filename (e.g., `alt="logo.png"`)
  - Add alt with filename without extension (e.g., `alt="logo"`)
  - Add alt with filename + "image" (e.g., `alt="logo image"`)
  - Add custom alt text
- Supports `.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`.

## Requirements
- Install `astro-build.astro-vscode` for `.astro` files.
- Install `svelte.svelte-vscode` for `.svelte` files.

## Usage
1. Open an HTML, JSX, TSX, Vue, Svelte, or Astro file.
2. Run `Alt Text Fixer: Scan File` from the Command Palette (`Ctrl+Shift+P`).
3. Click the bulb icon or use `Ctrl+.` to apply fixes.

## Troubleshooting
- If the scan command fails, add to `settings.json`:
  ```json
  "files.associations": {
    "*.jsx": "javascriptreact",
    "*.astro": "astro",
    "*.svelte": "svelte"
  }