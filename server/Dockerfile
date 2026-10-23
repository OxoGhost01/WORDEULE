FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js config.js ./
ENV DATA_FILE=/data/scores.json
EXPOSE 3000
CMD ["node", "server.js"]
