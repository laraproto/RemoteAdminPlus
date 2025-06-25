FROM oven/bun:debian AS build
LABEL authors="laraproto"

ARG API_URL
ARG PUBLIC_API_URL
ARG URL
ARG PUBLIC_URL
ARG DOMAIN
ARG PUBLIC_DOMAIN

WORKDIR /app
COPY . /app

RUN bun install --frozen-lockfile

WORKDIR /app/website
RUN bun run build

FROM oven/bun:debian AS main

EXPOSE 3000

COPY --from=build /app /app