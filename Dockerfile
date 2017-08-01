FROM node:8

WORKDIR /src
COPY . /src

CMD ["npm", "start"]
