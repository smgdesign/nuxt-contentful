FROM node:18-alpine AS builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk update && apk upgrade

COPY . .
RUN corepack enable
RUN yarn install
RUN yarn build


FROM node:18-alpine AS runner

WORKDIR /usr/src/app

RUN apk update && apk upgrade

COPY --from=builder /usr/src/app /usr/src/app/
RUN npm install pm2 -g

EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.js"]
