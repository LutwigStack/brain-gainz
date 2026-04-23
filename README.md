# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Mobile Shell

Capacitor is wired as the mobile shell on top of the existing web app.

Useful scripts:

- `npm run cap:copy` — build web assets and copy them into native shells.
- `npm run cap:sync` — build, copy, and sync Capacitor plugins.
- `npm run cap:android` — sync and open the Android project.
- `npm run cap:ios:sync` — sync the iOS project files.

Notes:

- `android/` and `ios/` are generated platform folders and are excluded from ESLint.
- Full iOS build/run still requires macOS with Xcode.
- The app shell now includes viewport-fit and safe-area handling for mobile webviews.

## Desktop Shell

Tauri stays in the project as the desktop local-first shell, not as the universal runtime for every platform.

Current desktop contract:

- desktop uses the Tauri window and capability policy from `src-tauri/`;
- desktop uses native SQLite through `@tauri-apps/plugin-sql`;
- web and Capacitor continue to use browser-backed storage paths instead of sharing the Tauri runtime;
- runtime selection is centralized in `src/platform/runtime.js` and consumed by both the UI shell and database bootstrap.

Desktop-first advantages kept intentionally:

- local SQLite persistence;
- desktop windowing and native capability gating;
- future path for file attachments and other local-first features without forcing them into web/mobile first.
