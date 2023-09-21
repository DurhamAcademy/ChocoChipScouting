## Dockerfile
#FROM node:11.13.0-alpine as base
#
## create destination directory
#RUN mkdir -p /usr/src/nuxt-app
#WORKDIR /usr/src/nuxt-app
#
## copy the app, note .dockerignore
#FROM base as build
#COPY . /usr/src/nuxt-app/
#RUN npm config set strict-ssl false
#RUN npm ci --omit=dev
#RUN npm run build
#
## run build
#FROM base as final
#

FROM node:latest as base
RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY .output .output

EXPOSE 3000

#ENV NUXT_HOST=0.0.0.0
#ENV NUXT_PORT=3000

RUN node .output/server/index.mjs
