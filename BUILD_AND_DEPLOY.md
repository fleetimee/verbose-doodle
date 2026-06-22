# Build and Deployment Guide

This guide explains how to build Docker images on your local machine and deploy them to the server.

## Architecture Overview

- **Local Machine (Host)**: Build AMD64/Linux images and push to Harbor registry
- **Server**: Pull pre-built images from Harbor and run containers
- **Network**: Containers communicate via `biller-simulator-json-net` Docker network

## Prerequisites

### On Local Machine
- Docker with buildx support
- Access to Harbor registry (`harbor.local`)
- Docker logged in to Harbor: `docker login harbor.local`

### On Server
- Docker installed
- Access to Harbor registry
- Docker logged in to Harbor: `docker login harbor.local`
- Backend service running on `biller-simulator-json-net` network

## Build Process (Local Machine)

### Option 1: Using the Build Script (Recommended)

```bash
# Make the script executable
chmod +x build-and-push.sh

# Run the build script
./build-and-push.sh
```

The script will:
1. Build the base image with Bun and dependencies
2. Push base image to Harbor
3. Build the deployment image with compiled app and nginx
4. Push deployment image to Harbor

### Option 2: Manual Build with Docker Compose

```bash
# Build base image
docker-compose -f docker-compose-kantor-build.yml build

# Push base image
docker push harbor.local/react-app/biller-simulator-json:bun-base

# Build deployment image
docker buildx build \
  --platform linux/amd64 \
  --file Dockerfile.kantor.deploy \
  --tag harbor.local/react-app/biller-simulator-json:result \
  --tag harbor.local/react-app/biller-simulator-json:latest \
  --load \
  .

# Push deployment images
docker push harbor.local/react-app/biller-simulator-json:result
docker push harbor.local/react-app/biller-simulator-json:latest
```

### Option 3: Build Both Images at Once

```bash
# Build both base and deployment images
docker-compose -f docker-compose-kantor-build-full.yml build

# Push all images
docker push harbor.local/react-app/biller-simulator-json:bun-base
docker push harbor.local/react-app/biller-simulator-json:result
```

## Deployment Process (Server)

### Initial Setup

```bash
# 1. Ensure backend network exists
docker network ls | grep biller-simulator-json-net

# If network doesn't exist, the backend docker-compose should create it
# The network should already exist from the backend service

# 2. Ensure backend is running
docker ps | grep biller-simulator-app
```

### Deploy Frontend

```bash
# 1. Pull the latest image from Harbor
docker pull harbor.local/react-app/biller-simulator-json:result

# 2. Stop and remove old container (if exists)
docker-compose -f docker-compose-kantor-deploy.yml down

# 3. Start the new container
docker-compose -f docker-compose-kantor-deploy.yml up -d

# 4. Verify the container is running
docker ps | grep biller-simulator-frontend

# 5. Check logs
docker logs biller-simulator-frontend

# 6. Verify health
docker inspect biller-simulator-frontend | grep -A 10 Health
```

### Access the Application

- **Frontend**: http://192.168.4.79:41923
- **Backend API**: http://192.168.4.79:37847

## Network Configuration

The frontend connects to the backend via Docker networking:

```
┌─────────────────────────────────────────────────────┐
│  Docker Network: biller-simulator-json-net          │
│                                                      │
│  ┌─────────────────┐      ┌──────────────────┐    │
│  │   Frontend      │─────▶│    Backend       │    │
│  │   nginx:80      │      │   spring:8080    │    │
│  │   container:    │      │   container:     │    │
│  │   biller-       │      │   biller-        │    │
│  │   simulator-    │      │   simulator-app  │    │
│  │   frontend      │      │                  │    │
│  └─────────────────┘      └──────────────────┘    │
│         │                           │               │
└─────────┼───────────────────────────┼───────────────┘
          │                           │
          ▼                           ▼
    Host: 41923                  Host: 37847
```

- Frontend connects to backend via: `http://biller-simulator-app:8080`
- Users access frontend via: `http://192.168.4.79:41923`
- Users access backend API via: `http://192.168.4.79:37847`

## Images in Harbor

After building, the following images are available:

1. **bun-base**: Base image with Bun runtime and node_modules
   - `harbor.local/react-app/biller-simulator-json:bun-base`
   - Used as base for building the deployment image
   - Only needs to be rebuilt when dependencies change

2. **result/latest**: Deployment image with compiled app and nginx
   - `harbor.local/react-app/biller-simulator-json:result`
   - `harbor.local/react-app/biller-simulator-json:latest`
   - Contains the built React app and nginx configuration
   - Rebuild whenever code changes

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs biller-simulator-frontend

# Check if backend is reachable from frontend container
docker exec biller-simulator-frontend wget -O- http://biller-simulator-app:8080/api/health
```

### Network issues
```bash
# Verify both containers are on the same network
docker network inspect biller-simulator-json-net

# Should show both containers:
# - biller-simulator-app (backend)
# - biller-simulator-frontend (frontend)
```

### Image pull fails
```bash
# Verify Harbor login
docker login harbor.local

# Manually pull image
docker pull harbor.local/react-app/biller-simulator-json:result
```

### Port already in use
```bash
# Check what's using port 41923
lsof -i :41923

# Or change the port in docker-compose-kantor-deploy.yml
ports:
  - "DIFFERENT_PORT:80"
```

## Updating the Application

### For Code Changes

```bash
# On Local Machine
./build-and-push.sh

# On Server
docker pull harbor.local/react-app/biller-simulator-json:result
docker-compose -f docker-compose-kantor-deploy.yml up -d --force-recreate
```

### For Dependency Changes

```bash
# On Local Machine
# Delete old base image to force rebuild
docker rmi harbor.local/react-app/biller-simulator-json:bun-base

# Rebuild everything
./build-and-push.sh

# On Server
docker pull harbor.local/react-app/biller-simulator-json:bun-base
docker pull harbor.local/react-app/biller-simulator-json:result
docker-compose -f docker-compose-kantor-deploy.yml up -d --force-recreate
```

## Quick Reference

### Local Machine Commands
```bash
# Build and push all images
./build-and-push.sh

# Or manually
docker-compose -f docker-compose-kantor-build-full.yml build
docker-compose -f docker-compose-kantor-build-full.yml push
```

### Server Commands
```bash
# Deploy/Update
docker pull harbor.local/react-app/biller-simulator-json:result
docker-compose -f docker-compose-kantor-deploy.yml up -d

# Stop
docker-compose -f docker-compose-kantor-deploy.yml down

# View logs
docker logs -f biller-simulator-frontend

# Restart
docker-compose -f docker-compose-kantor-deploy.yml restart
```
