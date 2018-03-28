FROM node:8-alpine

ARG http_proxy=""
ARG https_proxy=""

WORKDIR /app

COPY package.json /app/package.json

ENV http_proxy $http_proxy
ENV https_proxy $https_proxy

RUN npm config set proxy $http_proxy
RUN npm config set https-proxy $https_proxy

RUN npm install && rm -rf ~/.npm

COPY . /app/

ENV DEBUG=salman-activity-backend:server

CMD [ "npm", "start" ]