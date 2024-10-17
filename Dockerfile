FROM node:19-alpine3.15

WORKDIR /demo

COPY . /demo
RUN npm install 

EXPOSE 3000
CMD ["npm","run","dev"]
