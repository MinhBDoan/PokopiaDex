# PokopiaDex

## Run locally

Use Node.js 22.13+ (or Node.js 24+) and npm. Run `npm ci`, then `npm run dev` and open the URL printed in the terminal.

## Organize Pokémon

Search the catalog and select a Pokémon to see its artwork, types, specialties, and current region. Region buttons assign immediately; Unassign removes an assignment. All catalog entries remain available after assignment. Region collections appear as full-width sections below the workspace. The catalog and populated collections scroll independently.

Desktop users can drop a catalog grip directly onto a region choice in the right panel, even before selecting a Pokémon. A successful region drop selects the dragged Pokémon and shows its updated assignment. Clicking a region still requires a selection; dragging always uses the dragged Pokémon, not the previous selection.

Each region includes an alphabetized Specialties summary derived from its residents. A specialty appears once, with a count of Pokémon providing it. Missing specialty data is identified rather than treated as a known absence. Summaries update automatically on assignment, moving, unassigning, or resetting.

Assignments save automatically in this browser's local storage. They do not sync between devices. Settings → Reset Saved Data clears assignments. Desktop users can also drag the grips onto region choices or region sections. Dropping on the catalog or outside a region leaves assignments unchanged; use the explicit Unassign button to remove an assignment. Use selection and assignment buttons on touch devices or with a keyboard. After selecting a Pokémon with the keyboard, Tab to its Assign shortcut and press Enter to focus the region controls.

## Checks

```sh
npm run build
npm run lint
npx playwright install chromium
npm run test:e2e
```

The browser suite starts its own local dev server on port 4178 and uses isolated storage. It covers selection, search, assignment, persistence, reset, drag/drop validation, keyboard navigation, other tabs, and narrow-screen layout. Most tests intentionally block remote artwork to exercise fallbacks. Test reports and screenshots are generated under ignored `test-results/`. Optionally set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome instead of Playwright's Chromium.

## Vite template reference

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
