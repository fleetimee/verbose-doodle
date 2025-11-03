FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app
LABEL maintainer="Novian Andika"

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

FROM base AS release
COPY --from=prerelease /usr/src/app/dist ./dist

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bunx", "--bun", "serve", "dist", "-l", "3000", "-s"]
