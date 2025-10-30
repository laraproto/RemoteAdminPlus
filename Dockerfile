FROM oven/bun:debian AS build
LABEL authors="laraproto"

ARG SERVER_API_URL
ARG URL

RUN useradd -m runner

USER runner

WORKDIR /app
COPY --chown=runner . /app

RUN bun install --frozen-lockfile

WORKDIR /app/website
RUN bun run build

FROM oven/bun:debian AS main

RUN useradd -m runner

EXPOSE 3000

COPY --from=build /app /app
