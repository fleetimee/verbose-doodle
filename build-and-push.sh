#!/bin/bash


set -e  # Exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

HARBOR_REGISTRY="harbor.local"
PROJECT="react-app"
IMAGE_NAME="biller-simulator-json"
PLATFORM="linux/amd64"

echo -e "${GREEN}=== Biller Simulator Frontend Build Script ===${NC}"
echo -e "${YELLOW}Platform: ${PLATFORM}${NC}"
echo ""

echo -e "${GREEN}Step 1/3: Building base image with Bun and dependencies...${NC}"
docker buildx build \
  --platform ${PLATFORM} \
  --file Dockerfile.kantor.build \
  --target bun-base \
  --tag ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:bun-base \
  --load \
  .

echo -e "${GREEN}✓ Base image built successfully${NC}"
echo ""

echo -e "${GREEN}Step 2/3: Pushing base image to Harbor...${NC}"
docker push ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:bun-base

echo -e "${GREEN}✓ Base image pushed successfully${NC}"
echo ""

echo -e "${GREEN}Step 3/3: Building deployment image...${NC}"
docker buildx build \
  --platform ${PLATFORM} \
  --file Dockerfile.kantor.deploy \
  --tag ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:latest \
  --tag ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:result \
  --load \
  .

echo -e "${GREEN}✓ Deployment image built successfully${NC}"
echo ""

echo -e "${GREEN}Pushing deployment image to Harbor...${NC}"
docker push ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:latest
docker push ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:result

echo -e "${GREEN}✓ Deployment image pushed successfully${NC}"
echo ""

echo -e "${GREEN}=== Build Complete ===${NC}"
echo -e "Images pushed to Harbor:"
echo -e "  - ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:bun-base"
echo -e "  - ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:latest"
echo -e "  - ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:result"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. SSH to your server"
echo -e "  2. Pull the latest image: docker pull ${HARBOR_REGISTRY}/${PROJECT}/${IMAGE_NAME}:result"
echo -e "  3. Run: docker-compose -f docker-compose-kantor-deploy.yml up -d"
echo ""
