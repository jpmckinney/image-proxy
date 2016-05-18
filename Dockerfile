FROM node:6.1.0
COPY . /src
WORKDIR /src
RUN npm install
CMD node bin/image-proxy
