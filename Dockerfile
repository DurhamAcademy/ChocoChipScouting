# Ubuntu With Curl
FROM ubuntu AS install-curl

RUN apt-get -y update
RUN apt-get -y install curl

# the setup script
FROM install-curl AS setup


CMD curl -X PUT http://admin:password@couchdb:5984/_users; \
    curl -X PUT http://admin:password@couchdb:5984/_replicator; \
    curl -X PUT http://admin:password@couchdb:5984/_global_changes; \
    curl -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/httpd/enable_cors -d '"true"' -v; \
    curl -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/cors/origins -d '"*"'; \
    curl -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/cors/credentials -d '"true"'; \
    curl -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'; \
    curl -X PUT http://admin:password@couchdb:5984/_node/nonode@nohost/_config/cors/headers -d '"accept, authorization, content-type, origin, referer, x-csrf-token"'

# Main Server
FROM oven/bun:1-alpine AS bun-base
RUN mkdir -p /usr/src/nuxt3-app
WORKDIR /usr/src/nuxt3-app

FROM node:17-alpine AS base
RUN mkdir -p /usr/src/nuxt3-app
WORKDIR /usr/src/nuxt3-app

FROM base as packagejson
COPY package.json /usr/src/nuxt3-app/package.json

FROM packagejson AS pnpm

RUN npm install pnpm -g

FROM pnpm AS install
COPY package.json .
COPY package-lock.json .
COPY node_modules .
RUN pnpm i --shamefully-hoist

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

RUN ["bun", "--bun", "run", "postinstall"]

FROM bun-prepare AS files

COPY app.vue .
COPY pages ./pages
COPY public ./public
COPY server ./server
COPY components ./components
COPY utils ./utils

FROM files AS build

RUN bun --bun run build

FROM oven/bun:1-alpine as run

RUN mkdir -p /usr/src/nuxt3-app
WORKDIR /usr/src/nuxt3-app

COPY --from=build /usr/src/nuxt3-app/.output .output

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

ENTRYPOINT ["bun", ".output/server/index.mjs"]

HEALTHCHECK \
    --interval=10s \
    --timeout=3s \
    --start-period=100ms \
    --retries=5 \
    CMD bun repl -e "const http = require('http');\
                 http.get('http://0.0.0.0:3000/', res => {\
                   let data = [];\
                   const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';\
                   console.log('Status Code:', res.statusCode);\
                   console.log('Date in Response header:', headerDate);\
                   res.on('data', chunk => {\
                     data.push(chunk);\
                   });\
                   res.on('end', () => {\
                     console.log('Response ended: ');\
                     const users = Buffer.concat(data).toString();\
                     console.log(users)\
                     if (res.statusCode !== 200) {\
                       process.exit(1);\
                     } else process.exit()\
                   });\
                 }).on('error', err => {\
                   process.exit(1);\
                 });"