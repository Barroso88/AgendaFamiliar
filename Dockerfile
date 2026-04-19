FROM node:22-alpine

WORKDIR /app

COPY . .

ENV PORT=3035
ENV DATA_DIR=/app/data

EXPOSE 3035

# A linha mágica para o Unraid! 
# Força o contentor a correr como utilizador 'nobody' (UID 99) e grupo 'users' (GID 100)
USER 99:100

CMD ["node", "server.js"]
