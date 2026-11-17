FROM node:24-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev
COPY server ./server
COPY shared ./shared
RUN mkdir /data && chown node:node /data
ENV NODE_ENV=production DATA_DIR=/data
WORKDIR /app/server
USER node
EXPOSE 3000
CMD ["node", "index.js"]
