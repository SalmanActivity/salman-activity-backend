FROM node:9.0.0

WORKDIR /app

COPY . .

ARG PROXY
ENV PROXY=$PROXY

EXPOSE 3000

RUN npm config set proxy $PROXY
RUN npm config set strict-ssl false
RUN npm config set registry http://registry.npmjs.org/
RUN npm install

CMD ["npm", "start"]
