FROM node:16.13
RUN apt-get update
RUN apt-get install -y chromium
WORKDIR /app
COPY . .
RUN yarn
EXPOSE 3000
ENTRYPOINT ["node", "src/index.js"]
