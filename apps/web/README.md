# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Event Seating Web Application

## Testing

The project uses Vitest and React Testing Library for testing. Here are the available test commands:

### Test Commands

```bash
# Run tests in watch mode (interactive)
pnpm test

# Run tests with coverage report
pnpm test:coverage

# Run tests with UI interface
pnpm test:ui

# Run tests in CI mode (single run)
pnpm test run
```

### Test File Naming Conventions

Place your test files using one of these patterns:
- `*.test.tsx` - for React component tests
- `*.test.ts` - for utility/hook tests
- `*.spec.tsx` - alternative naming for component tests
- `*.spec.ts` - alternative naming for utility tests

### Example Test

```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Test Location

Place test files either:
1. Next to the component/module they test (recommended)
   ```
   src/components/
   ├── Button.tsx
   └── Button.test.tsx
   ```
2. In a separate test directory mirroring the source structure
   ```
   src/
   ├── components/
   │   └── Button.tsx
   └── __tests__/
       └── components/
           └── Button.test.tsx
   ```
