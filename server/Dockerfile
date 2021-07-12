FROM node:alpine

WORKDIR /usr/src/teams_backend

COPY ./package*.json ./
RUN npm install

COPY ./ ./

EXPOSE 4193
EXPOSE 9000

CMD ["npm", "start"]