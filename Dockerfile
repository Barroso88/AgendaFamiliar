FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3035
ENV DATA_DIR=/data
VOLUME ["/data"]

EXPOSE 3035

CMD ["node", "server.js"]
