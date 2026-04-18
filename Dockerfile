FROM node:22-alpine

WORKDIR /app

COPY . .

ENV PORT=3035
ENV DATA_DIR=/data

VOLUME ["/data"]

EXPOSE 3035

CMD ["node", "server.js"]
