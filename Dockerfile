FROM node:18.20.4-alpine3.20 AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ \
  && corepack enable \
  && corepack prepare yarn@1.22.19 --activate

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json nestconfig.json index.js ./
COPY src ./src

RUN yarn build


FROM node:18.20.4-alpine3.20 AS runner

WORKDIR /app

RUN apk add --no-cache libstdc++ \
  && corepack enable \
  && corepack prepare yarn@1.22.19 --activate

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]