FROM node:20-alpine3.19

WORKDIR /app

COPY frontend/. /app/

RUN npm install

RUN NODE_ENV=production npm run build

CMD [ "npm", "start" ]