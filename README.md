# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Letter_AI

Letter_AI is a web application built with **React + TypeScript + Vite**. This project provides a scalable architecture for building AI-driven applications with modern frontend tools.

## ⚡️ Tech Stack

- **React** with **TypeScript**
- **Vite** for fast development builds
- **TailwindCSS** (optional)
- **ESLint** with recommended configurations
- **Prettier** (optional)
- **HMR (Hot Module Replacement)**

## 🚀 Getting Started

### Clone the repository
```bash
git clone https://github.com/sanggitsaaran/Letter_AI.git
cd Letter_AI
````

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## 🛠️ ESLint Configuration

The ESLint config uses `@typescript-eslint` recommended settings. If you want stricter rules or type-aware linting, update `eslint.config.js` like:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

For React-specific lint rules:

```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## 👨‍💻 Author

**Sanggit Saaran K C S**

* 🔗 [LinkedIn](https://www.linkedin.com/in/sanggit-saaran-k-c-s/)
* 💻 [GitHub](https://github.com/sanggitsaaran)

---