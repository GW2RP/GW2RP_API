FROM node:10

WORKDIR /usr/app/

COPY package.json package-lock.json ./

RUN npm install --production

COPY ./ ./

EXPOSE 80

CMD export NODE_ENV=production && npm start