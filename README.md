# Fleetime Labs frontend

React and Vite frontend for internal integration testing. Fleetime Labs includes Biller Simulator, TCP/UDP socket testing, SOCKS relay inspection, and developer tools. Authenticated workflows connect to a separate Biller Simulator backend.

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
bun run test        # Run the test suite with isolation
bun run preview     # Serve the production build locally
```

## Domain terms

- A **Biller** is a billing service represented in the simulator. A biller owns zero or more endpoints.
- An **Endpoint** is a simulated API operation that belongs to exactly one biller. Use "endpoint" rather than "route" for this domain concept.

## Documentation

- [Deployment guide](docs/deployment.md)
- [Product scope and terminology](PRODUCT.md)
- [Design system](DESIGN.md)
- [Mascot references](docs/mascot.md)
