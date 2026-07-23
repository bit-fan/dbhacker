# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploying to GitHub Pages

This repo includes an automated GitHub Pages workflow at [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).

1. Push to the `main` branch.
2. In GitHub, go to Settings -> Pages.
3. Set Source to GitHub Actions.
4. Wait for the Deploy to GitHub Pages workflow to finish.

After deployment, the site will be publicly available at:

`https://<your-github-username>.github.io/<your-repo-name>/`

Notes:

- Base path is configured automatically via `VITE_BASE_PATH` in the workflow.
- SPA deep links are supported by generating `dist/404.html` from `dist/index.html`.
