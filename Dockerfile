# Ubuntu With Curl
FROM ubuntu AS install-curl

RUN apt-get -y update
RUN apt-get -y install curl

# the setup script
FROM install-curl AS setup


CMD curl -s -X PUT http://admin:password@couchdb:5984/_users; \
    curl -s -X PUT http://admin:password@couchdb:5984/_replicator; \
    curl -s -X PUT http://admin:password@couchdb:5984/_global_changes; \
    curl -s -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/chttpd/enable_cors -d '"true"'; \
    curl -s -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/cors/origins -d '"*"'; \
    curl -s -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/cors/credentials -d '"true"'; \
    curl -s -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'; \
    curl -s -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/cors/headers -d '"accept, authorization, content-type, origin, referer, x-csrf-token"'

# Main Server
FROM oven/bun:1-alpine AS bun-base
RUN mkdir -p /usr/src/nuxt3-app
WORKDIR /usr/src/nuxt3-app

FROM bun-base AS bun-install
COPY package-lock.json .
COPY package.json .
RUN ["bun", "install", "--ignore-scripts"]

FROM bun-install AS bun-prepare

COPY .npmrc .

COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .

COPY nuxt.config.ts .

FROM bun-prepare AS files

COPY app.vue .
COPY pages ./pages
COPY public ./public
COPY server ./server
COPY components ./components
COPY utils ./utils

RUN ["bun", "--bun", "run", "postinstall"]

FROM files AS build

RUN bun --bun run build

FROM oven/bun:1-alpine as run

RUN mkdir -p /usr/src/nuxt3-app
WORKDIR /usr/src/nuxt3-app

RUN apk upgrade --no-cache && apk add --no-cache libstdc++

COPY --from=build /usr/src/nuxt3-app/.output .output

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

ENTRYPOINT ["bun", ".output/server/index.mjs"]

COPY testServer.js .

HEALTHCHECK \
    --interval=10s \
    --timeout=3s \
    --start-period=100ms \
    --retries=5 \
    CMD bun testServer.js