FROM node:10

WORKDIR /usr/app/

EXPOSE 80

COPY package.json package-lock.json ./

RUN npm install --production

COPY ./ ./

RUN npm start