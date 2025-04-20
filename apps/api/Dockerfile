FROM 855471652329.dkr.ecr.us-east-1.amazonaws.com/node20-baseimage:latest AS build

WORKDIR /app

RUN apk add --no-cache python3 build-base ffmpeg

COPY apps/api/package.json ./

RUN npm install -g pnpm && pnpm install

COPY apps/api/ .

RUN pnpm build

FROM 855471652329.dkr.ecr.us-east-1.amazonaws.com/node20-baseimage:latest

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/.env ./

EXPOSE 3001

CMD ["pnpm", "start"]
