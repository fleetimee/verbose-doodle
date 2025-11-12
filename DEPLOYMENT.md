# Deployment Guide

This guide provides instructions for deploying the Biller Simulator application using Docker or Vercel.

## Production Deployment

### Prerequisites
- Docker 20.10 or higher
- Docker Compose V2
- amd64 Linux server

### Quick Start

#### 1. Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop the application
docker-compose -f docker-compose.production.yml down
```

The application will be available at `http://localhost:8080`

#### 2. Build Docker Image Only

```bash
# Build for amd64 platform
docker build -f Dockerfile.production --platform linux/amd64 -t biller-simulator:production .

# Run the container
docker run -d \
  --name biller-simulator \
  --platform linux/amd64 \
  -p 8080:80 \
  --restart always \
  biller-simulator:production
```

### Configuration

#### Port Mapping
By default, the application runs on port 8080. To change this, edit the `ports` section in `docker-compose.production.yml`:

```yaml
ports:
  - "YOUR_PORT:80"  # Change YOUR_PORT to desired port
```

#### Environment Variables
Available environment variables in `docker-compose.production.yml`:
- `NODE_ENV`: Set to `production`
- `TZ`: Timezone (default: `Asia/Jakarta`)

#### Backend API Proxy
The nginx configuration proxies `/api` and `/login` requests to the external backend at `http://143.198.85.201:47382`.

To change the backend URL, edit `nginx.conf`:
```nginx
location ~ ^/(api|login) {
    proxy_pass http://YOUR_BACKEND_URL;
    # ... rest of configuration
}
```

### Deployment to Production Server

#### Option 1: Using Docker Compose (Recommended)

1. Copy files to your server:
```bash
scp Dockerfile.production docker-compose.production.yml nginx.conf package.json bun.lockb user@server:/path/to/app/
scp -r src public index.html vite.config.ts tsconfig*.json user@server:/path/to/app/
```

2. SSH into your server and run:
```bash
cd /path/to/app
docker-compose -f docker-compose.production.yml up -d
```

#### Option 2: Build Locally and Push to Registry

1. Build and tag the image:
```bash
docker build -f Dockerfile.production --platform linux/amd64 -t your-registry/biller-simulator:latest .
```

2. Push to your registry:
```bash
docker push your-registry/biller-simulator:latest
```

3. Pull and run on your server:
```bash
docker pull your-registry/biller-simulator:latest
docker run -d -p 8080:80 --restart always your-registry/biller-simulator:latest
```

### Monitoring

#### Health Check
The container includes a built-in health check that runs every 30 seconds:
```bash
docker ps  # Check health status in STATUS column
```

#### View Logs
```bash
# Follow logs
docker logs -f biller-simulator-prod

# View last 100 lines
docker logs --tail 100 biller-simulator-prod
```

#### Container Stats
```bash
docker stats biller-simulator-prod
```

### Troubleshooting

#### Container won't start
```bash
# Check logs
docker logs biller-simulator-prod

# Inspect container
docker inspect biller-simulator-prod
```

#### Port already in use
```bash
# Change port in docker-compose.production.yml or use different port:
docker run -d -p 9090:80 --name biller-simulator biller-simulator:production
```

#### Build fails
```bash
# Clean build (no cache)
docker build --no-cache -f Dockerfile.production --platform linux/amd64 -t biller-simulator:production .
```

#### API proxy not working
- Verify the backend server is accessible from the Docker container
- Check nginx logs: `docker exec biller-simulator-prod cat /var/log/nginx/error.log`

### Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

# Or with no cache
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

### Security Notes

- The container runs nginx as the `nginx` user (non-root)
- Logs are limited to 10MB per file with 3 file rotation
- Security headers are configured in nginx.conf
- Static assets are served with appropriate cache headers

### Resource Limits

To add resource limits, update `docker-compose.production.yml`:

```yaml
services:
  biller-simulator:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Vercel Deployment

### Overview
The application can be deployed to Vercel with environment variable support for the backend API URL.

### Setup

1. **Install Vercel CLI** (optional):
```bash
bun add -g vercel
```

2. **Configure Environment Variable**:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add `VITE_ENDPOINT_URL` with your backend URL (e.g., `http://143.198.85.201:47382`)
   - This variable will be used by the serverless function in `api/proxy.ts`

3. **Deploy**:
```bash
# Using Vercel CLI
vercel

# Or push to your connected Git repository
git push origin main
```

### How It Works

The Vercel deployment uses:
- **`vercel.json`**: Routes `/api/*` to the serverless proxy function
- **`api/proxy.ts`**: Serverless function that forwards all administrative API requests to the backend using `VITE_ENDPOINT_URL`
- **Environment Variables**: Backend URL is configurable via Vercel project settings

### API Architecture

- **Administrative/Management APIs**: `/api/**` prefix
  - `/api/login`, `/api/refresh` (public auth endpoints)
  - `/api/users/**` (ADMIN only)
  - `/api/overview` (authenticated)
  - `/api/endpoint/**`, `/api/response/**`, `/api/biller/**` (authenticated/ADMIN)
- **Dynamic Simulator Endpoints**: Root level (`/**`)
  - Examples: `/inquiry`, `/payment`, `/check-status`
  - Public access (no authentication required)
  - These are NOT proxied through the serverless function

### Configuration Files

```json
// vercel.json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/proxy?path=api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ENDPOINT_URL` | Backend API server URL | `http://143.198.85.201:47382` |

### Vercel-Specific Notes

- The serverless function in `api/proxy.ts` handles API proxying with environment variable support
- Requests are forwarded with the original method, headers, and body
- The fallback backend URL is `http://143.198.85.201:47382` if `VITE_ENDPOINT_URL` is not set
- CORS and authentication headers are preserved during proxying

### Troubleshooting Vercel Deployment

#### API requests failing
- Check that `VITE_ENDPOINT_URL` is set in Vercel environment variables
- Verify the backend server is accessible from Vercel's infrastructure
- Review function logs in Vercel dashboard

#### Build errors
- Ensure all dependencies are in `package.json`
- Check that `@vercel/node` is installed as a dev dependency
- Verify `vercel.json` syntax is correct

## Support

For issues or questions, check:
- **Docker**: Application logs (`docker logs biller-simulator-prod`), Nginx logs, Build logs
- **Vercel**: Function logs in Vercel dashboard, Build logs in deployment panel
