# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and Biome linting powered by Ultracite.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Ultracite + Biome

Ultracite wraps Biome, providing instant feedback in supported editors and the same configuration that powers CLI checks. The shared settings live in `biome.json`.

### IDE integration

- Configure your editor with the Ultracite (Biome) extension so formatting and auto-fixes run on save and on paste.
- Introduce a small lint or format issue, save the file, and confirm that Ultracite formats it or highlights remaining problems in the Problems panel.
- Use the quick-fix lightbulb to apply suggestions that cannot be fixed automatically on save.

### CLI commands

- `bun lint` (alias for `bun run lint`) executes `ultracite check` for linting without writes.
- `npx ultracite fix` runs the same rules with auto-fixes applied.
- `npx ultracite fix --unsafe` applies additional unsafe fixes when you explicitly opt in.
- `npx ultracite doctor` validates your setup if you suspect a configuration issue.

### Pre-commit hook example

Add the following to `.git/hooks/pre-commit` if you want git commits to run lint checks automatically:

```bash
#!/bin/bash
echo "Running pre-commit checks..."

if ! npx ultracite check; then
  echo "Linting errors found. Please fix them before committing."
  exit 1
fi

if ! npx ultracite fix; then
  echo "Formatting issues found. Please format your code before committing."
  exit 1
fi

echo "Pre-commit checks passed."
exit 0
```
