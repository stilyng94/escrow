FROM node:lts-bullseye-slim@sha256:f959c0047e2cc2dc01459067d9e898b7780862e52f4e7e80bb674f6040298f32 AS base

RUN npm config set unsafe-perm true && npm install -g pnpm

ENV PNPM_FLAGS=--shamefully-hoist

WORKDIR /usr/app

## DEPENDENCIES
FROM base AS dependencies

ENV NODE_ENV=production

COPY pnpm-lock.yaml ./

RUN pnpm fetch --prod

COPY package.json ./

RUN pnpm install -r --offline --prod


## BUILD
FROM base AS builder

COPY pnpm-lock.yaml ./

RUN pnpm fetch

COPY package.json tsconfig.json ./

RUN pnpm install -r --offline

COPY ./ ./

RUN pnpm db:generate && pnpm build

# Production image
FROM node:lts-alpine3.18@sha256:d016f19a31ac259d78dc870b4c78132cf9e52e89339ff319bdd9999912818f4a AS final

RUN apk update && \
  apk add --no-cache ca-certificates openssl dumb-init && \
  rm -rf /var/cache/apk/*

ENV NODE_ENV=production

WORKDIR /usr/app

COPY --chown=node:node package.json ./
COPY --chown=node:node ./scripts/start.sh ./
COPY --from=dependencies --chown=node:node /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/dist ./dist

RUN chmod +x ./start.sh && chown node:node /app

EXPOSE ${PORT}

USER node

####### TARGETS

FROM final AS production

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["/bin/bash", "-c", "./start.sh"]

FROM final AS development

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["/bin/bash", "-c", "./start_dev.sh"]
