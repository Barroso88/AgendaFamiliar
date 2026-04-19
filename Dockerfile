FROM node:22-alpine

WORKDIR /app

COPY . .

ENV PORT=3035
ENV DATA_DIR=/app/data

VOLUME ["/app/data"]

EXPOSE 3035

CMD ["node", "server.js"]
