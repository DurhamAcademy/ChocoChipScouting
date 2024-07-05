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

# NPM package-lock.json
FROM node:lts-alpine AS package-lock-old
RUN mkdir -p /usr/src/nuxt3-app
WORKDIR /usr/src/nuxt3-app
COPY package.json package.json
#COPY .npmrc .
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
#COPY package-lock.json .
#RUN echo "{\"name\": \"scouting-app\",\"lockfileVersion\": 3,\"requires\": true,\"packages\": {}}" > package-lock.json
#RUN ["npm", "install", "--package-lock-only", "--ignore-scripts"]
#RUN ["npm", "update", "--package-lock=false"]

#
FROM node:20-bookworm-slim AS package-lock

#RUN #echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
#RUN apt update
#RUN #apt-get -y install python-software-properties git build-essential
#RUN #add-apt-repository -y ppa:chris-lea/node.js
#RUN apt-get install -y nodejs npm

WORKDIR /opt/app

COPY package.json .
COPY .npmrc .

RUN npm install --ignore-scripts

# Main Server
FROM oven/bun:latest AS bun-base
RUN mkdir -p /usr/src/nuxt3-app
WORKDIR /usr/src/nuxt3-app

# Add Certificates
FROM bun-base AS add-cert

RUN apt-get update
RUN apt-get install -y ca-certificates;

COPY LsFACert.cer /usr/local/share/ca-certificates/WebFilterCert.crt

RUN update-ca-certificates

FROM bun-base AS bun-install
#COPY --from=package-lock /opt/app/package-lock.json .
ENV NODE_TLS_REJECT_UNAUTHORIZED 0
RUN NODE_TLS_REJECT_UNAUTHORIZED=0
COPY .npmrc .
COPY package.json .
RUN ["bun", "install", "--ignore-scripts", "--no-progress", "--development"]

FROM bun-install AS bun-prepare

COPY .npmrc .

#COPY package-lock.json .

COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json

COPY nuxt.config.ts ./nuxt.config.ts
COPY app.config.ts ./app.config.ts

COPY vitest.config.ts ./vitest.config.ts

FROM bun-prepare AS files

COPY app.vue .

COPY ./pages ./pages
COPY ./public ./public
COPY ./server ./server
COPY ./components ./components
COPY ./utils ./utils
COPY ./plugins ./plugins
COPY ./service-worker ./service-worker
COPY ./composables ./composables

COPY ./tests ./tests

COPY ./app.vue .

RUN ["bun", "--bun", "run", "postinstall"]

RUN bun i --development

FROM node:lts AS test

WORKDIR /usr/src/nuxt3-app

ENV NODE_ENV development


COPY --from=files /usr/src/nuxt3-app/pages ./pages
COPY --from=files /usr/src/nuxt3-app/public ./public
COPY --from=files /usr/src/nuxt3-app/server ./server
COPY --from=files /usr/src/nuxt3-app/components ./components
COPY --from=files /usr/src/nuxt3-app/utils ./utils
COPY --from=files /usr/src/nuxt3-app/plugins ./plugins
COPY --from=files /usr/src/nuxt3-app/service-worker ./service-worker
COPY --from=files /usr/src/nuxt3-app/composables ./composables
COPY --from=files /usr/src/nuxt3-app/tests ./tests
COPY --from=files /usr/src/nuxt3-app/node_modules ./node_modules
COPY --from=files /usr/src/nuxt3-app/.nuxt ./.nuxt

COPY --from=files /usr/src/nuxt3-app/.npmrc .

COPY --from=files /usr/src/nuxt3-app/package.json .
COPY --from=files /usr/src/nuxt3-app/tsconfig.json .

COPY --from=files /usr/src/nuxt3-app/nuxt.config.ts .
COPY --from=files /usr/src/nuxt3-app/app.config.ts .
COPY --from=files /usr/src/nuxt3-app/app.vue .

COPY --from=files /usr/src/nuxt3-app/vitest.config.ts .

RUN npm install @vitest/ui

COPY <<EOF /usr/src/nuxt3-app/.env
couchDBHostname=couchdb
mode=development
SERVER_USERNAME=admin
SERVER_PASSWORD=password
COUCHDB_SERVER_USER=admin
COUCHDB_SERVER_PASSWORD=password
NUXT_COUCH_DB_SCHEME=http
NUXT_COUCH_DB_AUTHORITY=couchdb:5984
NUXT_COUCH_DB_SERVER_ADMIN_USER_USERNAME=admin
NUXT_COUCH_DB_SERVER_ADMIN_USER_PASSWORD=password
EOF

ENTRYPOINT ["sleep", "10000"]
#or any similar command that does nothing but forces itself to stay open

FROM files AS listdir

RUN rm -rf ./node_modules;

RUN ls -AR;

FROM files AS build
ENV NODE_ENV development

RUN ["bun", "--bun", "run", "build"]

FROM oven/bun:latest as production

RUN mkdir -p /usr/src/nuxt3-app
WORKDIR /usr/src/nuxt3-app

RUN #apk upgrade --no-cache && apk add --no-cache libstdc++

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

FROM files as development

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

ENV NODE_ENV development
ENTRYPOINT ["bun", "--bun", "run", "dev"]

COPY testServer.js .

HEALTHCHECK \
    --interval=10s \
    --timeout=3s \
    --start-period=100ms \
    --retries=5 \
    CMD bun testServer.js
