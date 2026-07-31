# Biller Simulator frontend

React and Vite frontend for configuring and testing simulated biller APIs. It connects to the Biller Simulator backend and provides endpoint, response, user, and developer tools.

## Requirements

- Bun
- Access to a running Biller Simulator backend

## Development

```bash
bun install
cp .env.example .env
bun dev
```

Set `VITE_ENDPOINT_URL` in `.env` to the backend URL. The default development server runs at `http://localhost:5173`.

## Common commands

```bash
bun run build       # Type-check and build for production
bun run type-check  # Run TypeScript without emitting files
bun run lint        # Check formatting and lint rules
bun test             # Run the test suite
bun run preview     # Serve the production build locally
```

## Documentation

- [Deployment guide](DEPLOYMENT.md)
- [Domain terms](CONTEXT.md)
- [NFC reader bridge](tools/nfc-reader-bridge/README.md)
