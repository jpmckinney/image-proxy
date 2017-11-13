FROM node:8

RUN apt update && apt install -yq gifsicle

WORKDIR /src
COPY . /src

CMD ["npm", "start"]
