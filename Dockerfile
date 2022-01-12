FROM node:16.13-alpine
WORKDIR /app
COPY . .
RUN yarn
EXPOSE 3000
ENTRYPOINT ["node", "src/index.js"]
