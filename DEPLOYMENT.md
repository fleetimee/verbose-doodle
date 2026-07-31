# Deployment

This project supports local Docker, the office Harbor setup, and Vercel. Choose one path below.

## Requirements

- Docker with Compose V2
- Bun for local development
- An accessible Biller Simulator backend

## Local Docker

Build and start the production container:

```bash
docker compose -f docker-compose.production.yml up -d --build
docker compose -f docker-compose.production.yml logs -f
```

The frontend is available at `http://localhost:8080`. Stop it with:

```bash
docker compose -f docker-compose.production.yml down
```

The production image uses `VITE_ENDPOINT_URL` when configured. For a custom port, change the port mapping in `docker-compose.production.yml`, for example `9090:80`.

## Office Harbor deployment

The Harbor workflow builds Linux AMD64 images and uses the shared Docker network `biller-simulator-json-net`. Log in to Harbor and make sure the backend is running on that network.

### Build and push

Run this on the build machine:

```bash
docker login harbor.local
./build-and-push.sh
```

The script publishes:

```text
harbor.local/react-app/biller-simulator-json:bun-base
harbor.local/react-app/biller-simulator-json:latest
harbor.local/react-app/biller-simulator-json:result
```

The base image only needs rebuilding when dependencies change. Build the deployment image for code changes.

### Deploy on the server

```bash
docker network inspect biller-simulator-json-net
docker ps | grep biller-simulator-app

docker pull harbor.local/react-app/biller-simulator-json:result
docker tag \
  harbor.local/react-app/biller-simulator-json:result \
  harbor.local/react-app/biller-simulator-json:resultv2
docker compose -f docker-compose-kantor-deploy.yml up -d
```

The current office Compose file uses the `resultv2` tag. The tag command keeps it aligned with the image produced by `build-and-push.sh`.

Check the deployment:

```bash
docker ps | grep biller-simulator-frontend
docker logs -f biller-simulator-frontend
docker network inspect biller-simulator-json-net
```

The office frontend is normally exposed on port `41923`.

To update it, pull the new image and recreate the container:

```bash
docker pull harbor.local/react-app/biller-simulator-json:result
docker tag harbor.local/react-app/biller-simulator-json:result harbor.local/react-app/biller-simulator-json:resultv2
docker compose -f docker-compose-kantor-deploy.yml up -d --force-recreate
```

## Vercel

Set `VITE_ENDPOINT_URL` in the Vercel project settings, then deploy with the Vercel CLI or by pushing to the connected Git repository:

```bash
bun add -g vercel
vercel
```

`vercel.json` sends `/api/*` requests to `api/proxy.ts`. Dynamic simulator endpoints at the root, such as `/inquiry` and `/payment`, are served by the backend and are not sent through the proxy.

## Configuration

For local development, copy `.env.example` to `.env` and set:

```dotenv
VITE_ENDPOINT_URL=http://your-backend-host:port
```

The nginx proxy in production must point to the same backend. Update `nginx.conf` if the backend address changes.

## Troubleshooting

```bash
# Production container logs
docker logs biller-simulator-prod

# Office container logs
docker logs biller-simulator-frontend

# Check a container and its network
docker inspect <container>
docker network inspect biller-simulator-json-net
```

If a port is already in use, change the host-side port in the relevant Compose file. If API requests fail, verify `VITE_ENDPOINT_URL`, the nginx proxy target, and backend connectivity from the container.
