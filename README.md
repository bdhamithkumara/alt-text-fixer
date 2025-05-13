# Alt Text Fixer

Detects missing or empty alt attributes in image tags across HTML, React, Next.js, Vue, Angular, Svelte, and Astro.

## ✨ Features

- Scans `<img>`, `<Image>`, and `<v-img>` tags.
- Highlights issues with a bulb icon.
- Quick fixes:
  - Add alt with filename (e.g., `alt="logo.png"`)
  - Add alt with filename without extension (e.g., `alt="logo"`)
  - Add alt with filename + "image" (e.g., `alt="logo image"`)
  - Add custom alt text.
- Supports `.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`.

## 📦 Requirements

- Install `astro-build.astro-vscode` for `.astro` files.
- Install `svelte.svelte-vscode` for `.svelte` files.

## 🚀 Usage

1. Open an HTML, JSX, TSX, Vue, Svelte, or Astro file.
2. Run `Alt Text Fixer: Scan File` from the Command Palette (`Ctrl+Shift+P`).
3. Click the bulb icon or use `Ctrl+.` to apply fixes.

## 📖 How It Works

### 🖥️ Step 1: Run the Extension  
Open your file and run `Alt Text Fixer: Scan File` from the Command Palette.

![Run Extension](https://i.ibb.co/21X8XhHC/1.gif)

---

### 💡 Step 2: Choose a Quick Fix Option

When a missing or empty `alt` attribute is detected, a bulb icon will appear in the gutter. Click the bulb or press `Ctrl+.` to see available options.

- **Option 1**: Add `alt` with filename and extension  
  ![Option 1](https://i.ibb.co/YT7XHGdV/oprion1.gif)

- **Option 2**: Add `alt` with filename only  
  ![Option 2](https://i.ibb.co/jkQCPYhY/option2.gif)

- **Option 3**: Add `alt` with filename + "image"  
  ![Option 3](https://i.ibb.co/mV0qh9Hv/option3.gif)

- **Option 4**: Add a custom alt text of your choice  
  ![Option 4](https://i.ibb.co/bj9DxJgs/option4.gif)

---

## 🛠️ Troubleshooting

If the scan command fails, add the following to your `settings.json`:

```json
"files.associations": {
  "*.jsx": "javascriptreact",
  "*.astro": "astro",
  "*.svelte": "svelte"
}
```

---

## 🌟 Support & Contributions

If you find this extension helpful, please consider giving the repo a ⭐ on GitHub — it means a lot!

All contributions are welcome!  
Feel free to open issues, suggest features, or submit a pull request. Let’s make web accessibility better together.

---

## 📄 License

[MIT](LICENSE.md)