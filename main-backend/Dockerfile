FROM node:21-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "start" ]